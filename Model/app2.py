import asyncio
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from ultralytics import YOLO
from starlette.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
import requests
from pathlib import Path
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import websockets

# Define your models and parameters
vendor_model = YOLO("D:\\5th Semester\\AI\\Project\\pyback\\street vendors.v2i.yolov8-obb\\runs\\detect\\train\\weights\\best.pt")
vehicle_model = YOLO("illegal_parking_model.pt")

FRAME_SKIP = 5  # Only process and send every 5th frame
QUEUE_SIZE = 20  # Limit queue size for smoother processing

tracked_vehicles = {}
frame_count = 0



# Adjusted thresholds
stationary_threshold = 15  # Increased to reduce false positives for stationary vehicles
illegal_threshold = 200  # Remains the same for illegal parking

tracked_vendors = {}
movement_threshold = 100  # Maximum movement (in pixels) to be considered stationary
stationary_frame_threshold = 40  # Minimum frames to classify as stationary
illegal_vendor_threshold = 200  # Frames to classify as illegal


illegal_vehicles_flag = False
illegal_vendors_flag = False


app = FastAPI()

# CORS configuration for allowing cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to restrict origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=4)

def process_frame(frame_data, frame_counter):
    
    
    """Process a single frame (detection logic)."""
    np_array = np.frombuffer(frame_data, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image.")

    img_resized = img
    frame_counter += 1

    # Detect vehicles
    vehicle_boxes = detect_vehicles(img_resized, vehicle_model)

    # Track and check vehicles
    stationary_vehicles, illegal_vehicles = track_and_check_vehicles(
        vehicle_boxes, tracked_vehicles, frame_counter,
        stationary_threshold=stationary_threshold, illegal_threshold=illegal_threshold
    )

    global illegal_vehicles_flag
    illegal_vehicles_flag = len(illegal_vehicles) > 0
    # Draw bounding boxes
    for (x1, y1, x2, y2) in vehicle_boxes:
        if (x1, y1, x2, y2) in illegal_vehicles:
            cv2.rectangle(img_resized, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(img_resized, "ILLEGAL", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        elif (x1, y1, x2, y2) in stationary_vehicles:
            cv2.rectangle(img_resized, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(img_resized, "STATIONARY", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
        else:
            cv2.rectangle(img_resized, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img_resized, "MOVING", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Detect vendors
    results = vendor_model.predict(img_resized, conf=0.5)
    vendor_boxes = []
    for result in results:
        if hasattr(result, 'boxes'):
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = box.conf.tolist()[0]
                cls = int(box.cls.tolist()[0])
                if conf > 0.5:
                    vendor_boxes.append((x1, y1, x2, y2))

    # Track vendors
    illegal_vendors = []
    stationary_vendors = []

    for (x1, y1, x2, y2) in vendor_boxes:
        center = ((x1 + x2) // 2, (y1 + y2) // 2)
        matched_vendor = None
        for vendor_id, data in tracked_vendors.items():
            prev_center = data['center']
            if np.linalg.norm(np.array(center) - np.array(prev_center)) < movement_threshold:
                matched_vendor = vendor_id
                break

        if matched_vendor is not None:
            tracked_vendors[matched_vendor]['center'] = center
            tracked_vendors[matched_vendor]['last_seen'] = frame_counter
            tracked_vendors[matched_vendor]['stationary_frames'] += 1
            if tracked_vendors[matched_vendor]['stationary_frames'] > illegal_vendor_threshold:
                illegal_vendors.append((x1, y1, x2, y2))
            elif tracked_vendors[matched_vendor]['stationary_frames'] > stationary_frame_threshold:
                stationary_vendors.append((x1, y1, x2, y2))
        else:
            tracked_vendors[len(tracked_vendors)] = {
                'center': center,
                'last_seen': frame_count,
                'stationary_frames': 0
            }

    for vendor_id in list(tracked_vendors.keys()):
        if frame_count - tracked_vendors[vendor_id]['last_seen'] > 2 * illegal_vendor_threshold:
            del tracked_vendors[vendor_id]

    global illegal_vendors_flag
    illegal_vendors_flag = len(illegal_vendors) > 0
    # Draw bounding boxes for vendors
    for (x1, y1, x2, y2) in vendor_boxes:
        color = (0, 255, 0)
        label = "MOVING VENDOR"
        if (x1, y1, x2, y2) in illegal_vendors:
            color = (0, 0, 255)
            label = "ILLEGAL VENDOR"
        elif (x1, y1, x2, y2) in stationary_vendors:
            color = (0, 255, 255)
            label = "STATIONARY VENDOR"
        cv2.rectangle(img_resized, (x1, y1), (x2, y2), color, 2)
        cv2.putText(img_resized, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    return img_resized

def detect_vehicles(frame, model):
    results = model(frame)
    vehicle_boxes = []
    for result in results:
        if hasattr(result, 'boxes'):
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()[:4]
                conf = box.conf.tolist()[0]
                cls = int(box.cls.tolist()[0])
                if conf > 0.5 and cls in [2, 3, 5, 7]:
                    vehicle_boxes.append((int(x1), int(y1), int(x2), int(y2)))

    return vehicle_boxes

def track_and_check_vehicles(vehicle_boxes, tracked_vehicles, frame_count, stationary_threshold=75, illegal_threshold=150, movement_threshold=5):
    stationary_vehicles = []
    illegal_vehicles = []

    for (x1, y1, x2, y2) in vehicle_boxes:
        center = ((x1 + x2) // 2, (y1 + y2) // 2)

        matched_vehicle = None
        for vehicle_id, data in tracked_vehicles.items():
            prev_center = data['center']
            if np.linalg.norm(np.array(center) - np.array(prev_center)) < movement_threshold:
                matched_vehicle = vehicle_id
                break

        if matched_vehicle is not None:
            tracked_vehicles[matched_vehicle]['center'] = center
            tracked_vehicles[matched_vehicle]['last_seen'] = frame_count
            tracked_vehicles[matched_vehicle]['stationary_frames'] += 1
            if tracked_vehicles[matched_vehicle]['stationary_frames'] > illegal_threshold:
                illegal_vehicles.append((x1, y1, x2, y2))
            elif tracked_vehicles[matched_vehicle]['stationary_frames'] > stationary_threshold:
                stationary_vehicles.append((x1, y1, x2, y2))
        else:
            tracked_vehicles[len(tracked_vehicles)] = {
                'center': center,
                'last_seen': frame_count,
                'stationary_frames': 0
            }

    for vehicle_id in list(tracked_vehicles.keys()):
        if frame_count - tracked_vehicles[vehicle_id]['last_seen'] > illegal_threshold * 2:
            del tracked_vehicles[vehicle_id]

    return stationary_vehicles, illegal_vehicles


def process_video(input_video_path, output_video_path):
    """Process an input video frame by frame and save the output video."""
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        raise ValueError(f"Error opening video file: {input_video_path}")

    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # Initialize VideoWriter for saving output
    out = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    global frame_counter
    frame_counter = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Process the frame
        processed_frame = process_frame(cv2.imencode('.jpg', frame)[1].tobytes(), frame_counter)

        # Write the frame to the output video
        out.write(processed_frame)
        # cv2.imshow("Processed Video", processed_frame)
        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

@app.get("/check")
async def check(query: str):
    try:
        # Log the received video link
        illegal_vehicles_flag, illegal_vendors_flag
        print(f"Received video link: {query}")
        
        # Fetch the video content from the link
        response = requests.get(query, stream=True)
        response.raise_for_status()  # Raise an error for HTTP errors
        
        # Save the video to a local file
        video_path = "downloaded_video.mp4"
        with open(video_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Log the successful download
        print(f"Video successfully downloaded to {video_path}")

        # Process the downloaded video
        output_path = "C:\\Users\\dell\\Downloads\\output_video.mp4"
        process_video(video_path, output_path)
        
        # Log the completion of processing
        absolute_output_path = os.path.abspath(output_path)
        print(f"Video processed and saved to {absolute_output_path}")
        
        if os.path.exists(output_path):
        # Return the file as a response
            return {"illegal_vehicles": illegal_vehicles_flag, "illegal_vendors": illegal_vendors_flag}
    except requests.RequestException as e:
        print(f"Error downloading video: {e}")
        raise HTTPException(status_code=400, detail="Error downloading video from the provided URL.")
    except Exception as e:
        print(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the video.")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    frame_counter = 0

    try:
        while True:
            frame_data = await websocket.receive_bytes()

            # Process the incoming frame and get the processed result
            processed_frame = process_frame(frame_data, frame_counter)

            # Send the processed frame back as a byte array
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()

            await websocket.send_bytes(frame_bytes)
            frame_counter += 1
    except WebSocketDisconnect:
        print("Client disconnected")