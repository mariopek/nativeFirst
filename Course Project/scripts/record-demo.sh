#!/usr/bin/env bash
# Record a simulator demo for a lesson:
#   1. Build & install <Project>.app onto the booted simulator
#   2. Start simctl screen recording (.mov)
#   3. Run the lesson's Maestro flow
#   4. Stop recording and also save a final screenshot
#
# Usage: ./scripts/record-demo.sh <lesson-dir> <ProjectName>
#   e.g. ./scripts/record-demo.sh "Course Project/lessons/swiftui-foundations/01-why-swiftui" BrewLog

set -euo pipefail

LESSON_DIR="${1:?usage: record-demo.sh <lesson-dir> <ProjectName>}"
PROJECT_NAME="${2:?usage: record-demo.sh <lesson-dir> <ProjectName>}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$ROOT_DIR/projects/$PROJECT_NAME"
FLOW_FILE="$LESSON_DIR/maestro/flow.yaml"
VIDEO_OUT="$LESSON_DIR/videos/demo.mov"
SCREENSHOT_OUT="$LESSON_DIR/videos/screen.png"
BUNDLE_ID="pekmario.com.${PROJECT_NAME}"

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "missing project: $PROJECT_DIR" >&2
  exit 1
fi
if [[ ! -f "$FLOW_FILE" ]]; then
  echo "missing flow file: $FLOW_FILE" >&2
  exit 1
fi

DEVICE_ID="$(xcrun simctl list devices booted -j | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; ids=[dev["udid"] for k,v in d.items() for dev in v if dev.get("state")=="Booted" and "iPhone" in dev["name"]]; print(ids[0] if ids else "")')"
if [[ -z "$DEVICE_ID" ]]; then
  echo "no booted iPhone simulator" >&2
  exit 1
fi
echo "device: $DEVICE_ID"

mkdir -p "$LESSON_DIR/videos"

echo "→ building ${PROJECT_NAME}.app"
xcodebuild \
  -project "$PROJECT_DIR/${PROJECT_NAME}.xcodeproj" \
  -scheme "$PROJECT_NAME" \
  -destination "platform=iOS Simulator,id=$DEVICE_ID" \
  -configuration Debug \
  -derivedDataPath "$ROOT_DIR/.derived-data/$PROJECT_NAME" \
  build >/tmp/${PROJECT_NAME}-build.log 2>&1
APP_PATH="$ROOT_DIR/.derived-data/$PROJECT_NAME/Build/Products/Debug-iphonesimulator/${PROJECT_NAME}.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "build did not produce app at $APP_PATH" >&2
  tail -40 /tmp/${PROJECT_NAME}-build.log
  exit 1
fi

echo "→ installing onto $DEVICE_ID"
xcrun simctl install "$DEVICE_ID" "$APP_PATH"
xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true

echo "→ starting screen recording"
rm -f "$VIDEO_OUT"
xcrun simctl io "$DEVICE_ID" recordVideo --codec=h264 --force "$VIDEO_OUT" &
REC_PID=$!
sleep 1

echo "→ running maestro flow"
"$HOME/.maestro/bin/maestro" test "$FLOW_FILE" || true

sleep 1
echo "→ stopping recording"
kill -INT "$REC_PID" 2>/dev/null || true
wait "$REC_PID" 2>/dev/null || true

echo "→ taking final screenshot"
xcrun simctl io "$DEVICE_ID" screenshot "$SCREENSHOT_OUT"

# Compress .mov → .mp4 (H.264 720p) so the file fits Cloudflare's 25 MB asset cap.
# Strips audio (we never record any) and re-encodes at CRF 30, which is fine for
# screen recordings since there is no fine detail to lose.
if command -v ffmpeg >/dev/null 2>&1 && [[ -f "$VIDEO_OUT" ]]; then
  COMPRESSED_OUT="${VIDEO_OUT%.mov}.mp4"
  ffmpeg -y -i "$VIDEO_OUT" \
    -vcodec libx264 -crf 30 -preset fast \
    -vf "scale=-2:720" -an -movflags +faststart \
    "$COMPRESSED_OUT" >/dev/null 2>&1 \
    && rm "$VIDEO_OUT" \
    && VIDEO_OUT="$COMPRESSED_OUT"
fi

echo "video → $VIDEO_OUT"
echo "screenshot → $SCREENSHOT_OUT"
