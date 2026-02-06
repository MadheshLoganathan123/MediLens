import cv2
import numpy as np
from PIL import Image
import io

class ImageProcessor:
    def __init__(self, target_size=(336, 336)):
        self.target_size = target_size

    def preprocess(self, image_bytes):
        """
        Preprocess the input image bytes for medical analysis.
        - Resize
        - Enhance contrast (CLAHE)
        - Normalize
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Invalid image format")

        # 1. Resize while maintaining aspect ratio (padding)
        image = self._resize_with_padding(image, self.target_size)

        # 2. Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # This is particularly useful for medical images like X-rays or skin lesions
        image = self._enhance_contrast(image)

        # 3. Normalize (standardize pixel values)
        # Convert to float32 for processing
        image_float = image.astype(np.float32) / 255.0
        
        # Standard ImageNet normalization (optional, depending on model)
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        image_normalized = (image_float - mean) / std

        return image_normalized

    def _resize_with_padding(self, image, target_size):
        h, w = image.shape[:2]
        th, tw = target_size
        
        # Scale factor
        scale = min(tw/w, th/h)
        nw, nh = int(w * scale), int(h * scale)
        
        image_resized = cv2.resize(image, (nw, nh))
        
        # Create a new canvas with padding (black)
        canvas = np.zeros((th, tw, 3), dtype=np.uint8)
        
        # Center the image on the canvas
        dx, dy = (tw - nw) // 2, (th - nh) // 2
        canvas[dy:dy+nh, dx:dx+nw] = image_resized
        
        return canvas

    def _enhance_contrast(self, image):
        # Convert to LAB color space to apply CLAHE on the L-channel
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        limg = cv2.merge((cl, a, b))
        final_image = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        return final_image

    @staticmethod
    def encode_image_to_base64(image_bytes):
        import base64
        return base64.b64encode(image_bytes).decode('utf-8')
