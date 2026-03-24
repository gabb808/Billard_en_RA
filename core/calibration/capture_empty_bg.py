import cv2
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
filename = REPO_ROOT / "home" / "background.jpg"
config_path = REPO_ROOT / "home" / "config.json"

#display black background
cv2.namedWindow("Billard", cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty("Billard", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

#Config camera
CAM_NUMBER = 0
if config_path.exists():
    with config_path.open("r", encoding="utf-8") as f:
        config = json.load(f)
        if ("camera" in config and "number" in config["camera"]):
            CAM_NUMBER = config["camera"]["number"]
else:
    print(f"Warning: config not found at {config_path}, using default camera {CAM_NUMBER}")

cap = cv2.VideoCapture(CAM_NUMBER)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

ret,frame = cap.read()
if ret:
    cv2.imwrite(str(filename), frame)
    print("The background has been reset")
else:
    print("The background could not have been reset. Error in capture_empty_bg.py")

cap.release()
cv2.destroyAllWindows()

print("Note: don't forget to hide the mouse clicker icon ;)")