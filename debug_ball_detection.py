#!/usr/bin/env python3
"""
Script de diagnostic complet pour la détection des boules.
Capture les étapes intermédiaires du traitement d'image et analyse les paramètres.
"""

import cv2
import json
import numpy as np
import time
from pathlib import Path

# Configuration
REPO_ROOT = Path(__file__).resolve().parent
HOME_DIR = REPO_ROOT / "home"
CALIB_JSON = HOME_DIR / "calibration_data.json"
CONFIG_JSON = HOME_DIR / "config.json"
BG_IMAGE = HOME_DIR / "background.jpg"
OUTPUT_DIR = HOME_DIR / "debug_detection"

# Créer le répertoire de debug
OUTPUT_DIR.mkdir(exist_ok=True)

class Camera:
    """Classe de caméra (copie de ball.py)"""
    def __init__(self, projection_matrix, pool_focus_matrix):
        self.projection_matrix = np.array(projection_matrix)
        self.pool_focus_matrix = np.array(pool_focus_matrix)

    def warp_projection(self, img: np.ndarray, size: tuple) -> np.ndarray:
        blue_chan = img[..., -1]
        return cv2.warpPerspective(blue_chan, self.pool_focus_matrix, size, flags=cv2.INTER_LINEAR)

    @classmethod
    def from_dict(cls, data: dict) -> "Camera":
        return cls(data["projection_matrix"], data["poolFocus_matrix"])


def analyze_frame(bkg, frame, camera, threshold_value=150):
    """Analyse complète d'une frame avec debug visuel"""
    
    print("\n" + "="*70)
    print("ANALYSE COMPLÈTE DE DÉTECTION DES BOULES")
    print("="*70)
    
    # Étape 1: Difference absolue
    diff = cv2.absdiff(bkg, frame)
    cv2.imwrite(str(OUTPUT_DIR / "01_absdiff.jpg"), diff)
    print(f"✓ Étape 1 - Soustraction AbsDiff créée")
    
    # Étape 2: Projection en perspective
    warped = camera.warp_projection(diff, (1920, 1080))
    cv2.imwrite(str(OUTPUT_DIR / "02_warped.jpg"), warped)
    print(f"✓ Étape 2 - Projection perspective appliquée")
    
    # Étape 3: Flou gaussien
    blurred = cv2.GaussianBlur(warped, (5, 5), 0)
    cv2.imwrite(str(OUTPUT_DIR / "03_blurred.jpg"), blurred)
    print(f"✓ Étape 3 - Flou gaussien appliqué")
    
    # Étape 4: Threshold
    _, thresholded = cv2.threshold(blurred, threshold_value, 255, cv2.THRESH_BINARY)
    cv2.imwrite(str(OUTPUT_DIR / "04_threshold.jpg"), thresholded)
    print(f"✓ Étape 4 - Seuil appliqué (valeur={threshold_value})")
    
    # Étape 5: Contours
    contours, _ = cv2.findContours(thresholded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    print(f"\n📊 CONTOURS DÉTECTÉS: {len(contours)} éléments")
    
    # Analyser chaque contour
    areas = []
    circularities = []
    valid_balls = []
    
    for idx, contour in enumerate(contours):
        moment = cv2.moments(contour)
        area = moment["m00"]
        
        if area > 0:
            areas.append(area)
            cx = int(moment["m10"] / area)
            cy = int(moment["m01"] / area)
            
            # Calculer la circularité
            contour_points = np.array(contour)[:, 0, :]
            distances = np.sqrt(((np.array([cx, cy]) - contour_points) ** 2).sum(axis=1))
            circularity = np.std(distances)
            circularities.append(circularity)
            
            radius = np.sqrt(area / np.pi)
            
            print(f"\n  Contour {idx}:")
            print(f"    • Aire (m00): {area:.0f} pixels²")
            print(f"    • Rayon équivalent: {radius:.1f} pixels")
            print(f"    • Circularité (écart-type): {circularity:.2f}")
            print(f"    • Position: ({cx}, {cy})")
            
            # Vérifier les critères
            is_valid = True
            reasons = []
            
            if area < 5026:  # DEFAULT_MIN_MOMENT_00
                is_valid = False
                reasons.append(f"Aire trop petite ({area:.0f} < 5026)")
            
            if circularity < 25:  # DEFAULT_MIN_DISTANCE
                is_valid = False
                reasons.append(f"Trop circulaire ({circularity:.2f} < 25)")
            
            if is_valid:
                valid_balls.append((cx, cy))
                print(f"    ✅ DÉTECTÉ COMME BOULE")
            else:
                print(f"    ❌ REJETÉ: {', '.join(reasons)}")
    
    # Statistiques
    print("\n" + "-"*70)
    print("📈 STATISTIQUES:")
    print("-"*70)
    
    if areas:
        print(f"Aire (pixels²):")
        print(f"  • Min: {min(areas):.0f}")
        print(f"  • Max: {max(areas):.0f}")
        print(f"  • Moyenne: {np.mean(areas):.0f}")
        print(f"  • Médiane: {np.median(areas):.0f}")
        
        print(f"\nCircularité (écart-type):")
        print(f"  • Min: {min(circularities):.2f}")
        print(f"  • Max: {max(circularities):.2f}")
        print(f"  • Moyenne: {np.mean(circularities):.2f}")
        print(f"  • Médiane: {np.median(circularities):.2f}")
    
    print(f"\n✅ BOULES DÉTECTÉES: {len(valid_balls)}")
    
    # Créer image de visualisation
    debug_img = cv2.cvtColor(thresholded, cv2.COLOR_GRAY2BGR)
    for cx, cy in valid_balls:
        cv2.circle(debug_img, (cx, cy), 35, (0, 255, 0), 3)
        cv2.putText(debug_img, f"({cx},{cy})", (cx-40, cy-40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    
    cv2.imwrite(str(OUTPUT_DIR / "05_detected_balls.jpg"), debug_img)
    
    print("\n💾 Images de debug sauvegardées dans:", OUTPUT_DIR)
    print("="*70)
    
    return {
        "total_contours": len(contours),
        "detected_balls": len(valid_balls),
        "areas": areas,
        "circularities": circularities,
        "valid_balls": valid_balls
    }


def suggest_parameters(analysis_result):
    """Suggère des paramètres optimisés basés sur l'analyse"""
    
    print("\n" + "="*70)
    print("💡 RECOMMANDATIONS DE PARAMÈTRES")
    print("="*70)
    
    if not analysis_result["areas"]:
        print("⚠️  Aucun contour détecté - impossible de recommander des paramètres")
        return
    
    # Calculer les valeurs optimales basées sur les données réelles
    min_area_detected = min(analysis_result["areas"])
    min_area_recommended = min_area_detected * 0.8  # Réduire de 20% pour avoir de la marge
    
    max_circularity = max(analysis_result["circularities"]) if analysis_result["circularities"] else 0
    circularity_recommended = max_circularity * 1.2  # Augmenter de 20% pour avoir de la marge
    
    print(f"\n📌 PARAMÈTRES ACTUELS (dans ball.py):")
    print(f"  • DEFAULT_MIN_MOMENT_00 = np.pi * 35 ** 2  # = 5026")
    print(f"  • DEFAULT_MIN_DISTANCE = 25")
    print(f"  • threshold = 150")
    
    print(f"\n📊 BASÉ SUR VOTRE CONFIGURATION RÉELLE:")
    print(f"  • Aire min détectée: {min_area_detected:.0f} pixels²")
    print(f"  • Rayon correspondant: {np.sqrt(min_area_detected / np.pi):.1f} pixels")
    print(f"  • Circularité max: {max_circularity:.2f}")
    
    print(f"\n✅ PARAMÈTRES RECOMMANDÉS:")
    print(f"  • DEFAULT_MIN_MOMENT_00 = np.pi * {np.sqrt(min_area_recommended / np.pi):.0f} ** 2")
    print(f"    (valeur: ~{min_area_recommended:.0f} au lieu de 5026)")
    print(f"  • DEFAULT_MIN_DISTANCE = {circularity_recommended:.0f}")
    print(f"    (valeur: ~{circularity_recommended:.0f} au lieu de 25)")
    print(f"  • threshold = 150  # ou essayer 120 si encore trop strict")
    
    print("\n💾 Fichier de modèle créé: RECOMMENDED_PARAMETERS.txt")
    
    with open(OUTPUT_DIR / "RECOMMENDED_PARAMETERS.txt", "w") as f:
        f.write("PARAMÈTRES RECOMMANDÉS POUR ball.py\n")
        f.write("="*50 + "\n\n")
        f.write(f"Données réelles collectées:\n")
        f.write(f"  Aire min: {min_area_detected:.0f} pixels²\n")
        f.write(f"  Circularité max: {max_circularity:.2f}\n\n")
        f.write(f"Recommandations:\n")
        f.write(f"DEFAULT_MIN_MOMENT_00 = np.pi * {np.sqrt(min_area_recommended / np.pi):.0f} ** 2\n")
        f.write(f"DEFAULT_MIN_DISTANCE = {circularity_recommended:.0f}\n")


def main():
    print("\n🎯 DÉMARRAGE DU DIAGNOSTIC DE DÉTECTION DES BOULES\n")
    
    # Charger les fichiers
    try:
        with open(CALIB_JSON, 'r') as f:
            calib_data = json.load(f)
        camera = Camera.from_dict(calib_data)
        print("✓ Calibration chargée depuis:", CALIB_JSON)
    except Exception as e:
        print(f"❌ Erreur lors du chargement de la calibration: {e}")
        return
    
    try:
        bkg = cv2.imread(str(BG_IMAGE))
        if bkg is None:
            raise Exception("Image non trouvée ou invalide")
        print(f"✓ Background chargé: {bkg.shape}")
    except Exception as e:
        print(f"❌ Erreur lors du chargement du background: {e}")
        return
    
    # Capturer un frame avec les boules
    print("\n📷 Capture d'une frame avec boules...")
    print("    (Posez les boules sur la table et attendez)")
    
    try:
        # Charger config pour la caméra
        with open(CONFIG_JSON, 'r') as f:
            config = json.load(f)
        cam_number = config.get("camera", {}).get("number", 0)
    except:
        cam_number = 0
    
    cap = cv2.VideoCapture(cam_number)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    
    # Laisser la caméra se stabiliser
    for _ in range(30):
        cap.read()
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Erreur: Impossible de capturer une frame")
        return
    
    print(f"✓ Frame capturée: {frame.shape}")
    
    # Analyser la frame
    result = analyze_frame(bkg, frame, camera, threshold_value=150)
    
    # Suggérer les paramètres
    suggest_parameters(result)
    
    print("\n✅ Diagnostic terminé!")


if __name__ == "__main__":
    main()
