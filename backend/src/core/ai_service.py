""" ai_service.py - Fichero que almacena las clases definidas de los
distintos modelos de la aplicación que interaccionan con el usuario """

import io
import os
import torch
from PIL import Image, ImageOps
from transformers import SiglipImageProcessor, SiglipForImageClassification

class AIGuesser:
    """ Clase que define el modelo de adivinación, la inicialización
    y su carga en memoria, y el método para comunicarse con él """

    def __init__(self, model_dir: str):

        self.model_dir = os.path.abspath(model_dir)
        self.device = torch.device("cpu")

        self.processor = SiglipImageProcessor.from_pretrained(self.model_dir, local_files_only=True)
        self.model = SiglipForImageClassification.from_pretrained(self.model_dir, local_files_only=True)

        self.model.eval()

    def guess(self, image_bytes: bytes):
        """ Método llamado por la ruta del backend, que se encarga de transformar la
        imagen recibida del lienzo, pasarla al modelo y devolver la respuesta al usuario """

        try:
            # Cargar imagen original (Lienzo blanco, trazo negro)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            # --- AUTO-CROP PARA MEJORAR PRECISIÓN ---
            # Pasamos a gris e invertimos para detectar dónde está el dibujo
            temp_bw = ImageOps.grayscale(img)
            temp_inv = ImageOps.invert(temp_bw)
            bbox = temp_inv.getbbox()

            if bbox:
                # Recortamos el dibujo
                img_cropped = img.crop(bbox)
                # Lo centramos en un cuadrado con fondo blanco
                w, h = img_cropped.size
                new_size = max(w, h) + 40
                square_img = Image.new("RGB", (new_size, new_size), (255, 255, 255))
                square_img.paste(img_cropped, ((new_size - w) // 2, (new_size - h) // 2))
                img_final = square_img
            else:
                img_final = img

            inputs = self.processor(images=img_final, return_tensors="pt").to(self.device)

            # inferencia
            with torch.no_grad():
                outputs = self.model(**inputs)
                predicted_class_idx = outputs.logits.argmax(-1).item()

            id2label = self.model.config.id2label
            label = id2label.get(str(predicted_class_idx)) or id2label.get(predicted_class_idx)

            if label:
                return label.replace('_', ' ').capitalize()

            return f"Clase {predicted_class_idx}"

        except Exception as e: # pylint: disable=broad-exception-caught
            print(f"Error en la predicción: {e}")
            return "Analizando..."
