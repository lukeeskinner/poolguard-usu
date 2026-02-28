import base64
import cv2
from dataclasses import dataclass
from typing import List


@dataclass
class Child:
    isInPool: bool
    distance: float


@dataclass
class FrameResult:
    image: str
    children: List[Child]
    warningLevel: int

    def to_dict(self):
        return {
            "image": self.image,
            "children": [
                {"isInPool": c.isInPool, "distance": c.distance}
                for c in self.children
            ],
            "warningLevel": self.warningLevel,
        }


def next_frame(image) -> FrameResult:
    _, buffer = cv2.imencode('.jpg', image)
    image_b64 = base64.b64encode(buffer).decode('utf-8')

    return FrameResult(
        image=image_b64,
        children=[],
        warningLevel=0,
    )