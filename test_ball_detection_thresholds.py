#!/usr/bin/env python3
"""
Script de test multi-seuil pour trouver les paramètres optimaux.
Teste différentes combinaisons de seuil pour maximiser les détections.
"""

import cv2
import json
import numpy as np
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
HOME_DIR = REPO_ROOT / "home"
CALIB_JSON = HOME_DIR / "calibration_data.json"
CONFIG_JSON = HOME_DIR / "config.json"
BG_IMAGE = HOME_DIR / "background.jpg"
OUTPUT_DIR = HOME_DIR / "debug_detection"

OUTPUT_DIR.mkdir(exist_ok=True)


class Camera:
    def __init__(self, projection_matrix, pool_focus_matrix):
        self.projection_matrix = np.array(projection_matrix)
        self.pool_focus_matrix = np.array(pool_focus_matrix)

    def warp_projection(self, img: np.ndarray, size: tuple) -> np.ndarray:
        blue_chan = img[..., -1]
        return cv2.warpPerspective(blue_chan, self.pool_focus_matrix, size, flags=cv2.INTER_LINEAR)

    @classmethod
    def from_dict(cls, data: dict) -> "Camera":
        return cls(data["projection_matrix"], data["poolFocus_matrix"])


def test_thresholds(bkg, frame, camera):
    """Teste différents seuils pour trouver le meilleur"""
    
    print("\n" + "="*70)
    print("TEST MULTI-SEUIL: Trouver le meilleur paramètre de threshold")
    print("="*70)
    
    # Étapes 1-3 (identiques pour tous)
    diff = cv2.absdiff(bkg, frame)
    warped = camera.warp_projection(diff, (1920, 1080))
    blurred = cv2.GaussianBlur(warped, (5, 5), 0)
    
    thresholds_to_test = [50, 80, 100, 120, 150, 180, 200]
    results = {}
    
    for threshold in thresholds_to_test:
        _, thresholded = cv2.threshold(blurred, threshold, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresholded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        results[threshold] = len(contours)
        print(f"Threshold {threshold:3d}: {len(contours):3d} contours détectés")
    
    optimal = max(results, key=results.get)
    print(f"\n✅ Threshold optimal: {optimal} ({results[optimal]} contours)")
    return optimal


def test_moment_thresholds(bkg, frame, camera, threshold_value=150):
    """Teste différents seuils de moment (taille)"""
    
    print("\n" + "="*70)
    print("TEST MOMENT: Trouver le meilleur seuil de taille d'objet")
    print("="*70)
    
    diff = cv2.absdiff(bkg, frame)
    warped = camera.warp_projection(diff, (1920, 1080))
    blurred = cv2.GaussianBlur(warped, (5, 5), 0)
    _, thresholded = cv2.threshold(blurred, threshold_value, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresholded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    moments = list(map(cv2.moments, contours))
    areas = [m["m00"] for m in moments if m["m00"] > 0]
    
    if not areas:
        print("❌ Aucun contour avec aire > 0")
        return None
    
    areas.sort()
    
    print(f"\nDistribution des aires (pixels²):")
    print(f"  Min: {min(areas):.0f}")
    print(f"  Q1:  {np.percentile(areas, 25):.0f}")
    print(f"  Q2:  {np.percentile(areas, 50):.0f}")
    print(f"  Q3:  {np.percentile(areas, 75):.0f}")
    print(f"  Max: {max(areas):.0f}")
    
    # Essayer plusieurs seuils
    print(f"\nTesting different moment thresholds:")
    
    test_values = [
        int(np.pi * 10 ** 2),  # rayon 10
        int(np.pi * 15 ** 2),  # rayon 15
        int(np.pi * 20 ** 2),  # rayon 20
        int(np.pi * 25 ** 2),  # rayon 25
        int(np.pi * 30 ** 2),  # rayon 30
        int(np.pi * 35 ** 2),  # rayon 35 (courant)
    ]
    
    for value in test_values:
        radius = np.sqrt(value / np.pi)
        count = len([a for a in areas if a >= value])
        print(f"  π * {radius:.0f}² = {value:5d}: {count:3d} objets au-dessus du seuil")
    
    # Recommandation: on veut détecter ~90% des contours
    threshold_90 = np.percentile(areas, 10)  # 90% sont au-dessus
    radius_90 = np.sqrt(threshold_90 / np.pi)
    print(f"\n✅ Recommandé pour détecter 90% des objets:")
    print(f"   DEFAULT_MIN_MOMENT_00 = np.pi * {radius_90:.0f} ** 2  # = {threshold_90:.0f}")
    
    return threshold_90


def test_circularity_thresholds(bkg, frame, camera, threshold_value=150, moment_threshold=None):
    """Teste différents seuils de circularité"""
    
    print("\n" + "="*70)
    print("TEST CIRCULARITÉ: Trouver le meilleur seuil d'écart-type")
    print("="*70)
    
    diff = cv2.absdiff(bkg, frame)
    warped = camera.warp_projection(diff, (1920, 1080))
    blurred = cv2.GaussianBlur(warped, (5, 5), 0)
    _, thresholded = cv2.threshold(blurred, threshold_value, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresholded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    moments = list(map(cv2.moments, contours))
    
    circularities = []
    
    for contour, moment in zip(contours, moments):
        area = moment["m00"]
        if area < (moment_threshold or 0):
            continue
        
        contour_points = np.array(contour)[:, 0, :]
        cx = moment["m10"] / area
        cy = moment["m01"] / area
        
        distances = np.sqrt(((np.array([cx, cy]) - contour_points) ** 2).sum(axis=1))
        circularity = np.std(distances)
        circularities.append(circularity)
    
    if not circularities:
        print("❌ Aucun contour valide après filtre de taille")
        return None
    
    circularities.sort()
    
    print(f"\nDistribution des circularités (écart-type des distances):")
    print(f"  Min: {min(circularities):.2f}")
    print(f"  Q1:  {np.percentile(circularities, 25):.2f}")
    print(f"  Q2:  {np.percentile(circularities, 50):.2f}")
    print(f"  Q3:  {np.percentile(circularities, 75):.2f}")
    print(f"  Max: {max(circularities):.2f}")
    
    # Recommandation: prendre la médiane + 50%
    recommended = np.percentile(circularities, 75)  # 75e percentile
    
    print(f"\n✅ Recommandé pour détecter les formes circulaires:")
    print(f"   DEFAULT_MIN_DISTANCE = {recommended:.1f}")
    
    return recommended


def main():
    print("\n🎯 TEST MULTI-SEUIL POUR DÉTECTION DES BOULES\n")
    
    # Charger les fichiers
    try:
        with open(CALIB_JSON, 'r') as f:
            calib_data = json.load(f)
        camera = Camera.from_dict(calib_data)
        print("✓ Calibration chargée")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return
    
    try:
        bkg = cv2.imread(str(BG_IMAGE))
        print(f"✓ Background chargé: {bkg.shape}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return
    
    # Capturer un frame
    print("\n📷 Capture d'une frame...")
    try:
        with open(CONFIG_JSON, 'r') as f:
            config = json.load(f)
        cam_number = config.get("camera", {}).get("number", 0)
    except:
        cam_number = 0
    
    cap = cv2.VideoCapture(cam_number)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    
    for _ in range(30):
        cap.read()
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Erreur: Impossible de capturer")
        return
    
    print(f"✓ Frame capturée: {frame.shape}")
    
    # Tests progressifs
    threshold = test_thresholds(bkg, frame, camera)
    moment_threshold = test_moment_thresholds(bkg, frame, camera, threshold)
    circularity_threshold = test_circularity_thresholds(bkg, frame, camera, threshold, moment_threshold)
    
    # Résumé final
    print("\n" + "="*70)
    print("📋 RÉSUMÉ DES RECOMMANDATIONS")
    print("="*70)
    
    if moment_threshold and circularity_threshold:
        radius = np.sqrt(moment_threshold / np.pi)
        print(f"""
À ajouter dans core/hal/drivers/ball/ball.py (autour ligne 22):

DEFAULT_MIN_MOMENT_00 = np.pi * {radius:.0f} ** 2     # {moment_threshold:.0f} au lieu de 5026
DEFAULT_MIN_DISTANCE = {circularity_threshold:.1f}              # Au lieu de 25
# threshold = {threshold}                         # Ligne 56, au lieu de 150
""")
        
        # Sauvegarder
        with open(OUTPUT_DIR / "TEST_RECOMMENDATIONS.txt", "w") as f:
            f.write("RECOMMANDATIONS DU TEST MULTI-SEUIL\n")
            f.write("="*50 + "\n\n")
            f.write(f"Threshold optimal: {threshold}\n")
            f.write(f"Moment threshold: {moment_threshold:.0f} (rayon {radius:.0f}px)\n")
            f.write(f"Circularity threshold: {circularity_threshold:.1f}\n\n")
            f.write("Code Python à utiliser:\n")
            f.write(f"DEFAULT_MIN_MOMENT_00 = np.pi * {radius:.0f} ** 2\n")
            f.write(f"DEFAULT_MIN_DISTANCE = {circularity_threshold:.1f}\n")


if __name__ == "__main__":
    main()
