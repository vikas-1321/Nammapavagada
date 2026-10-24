import os
from PIL import Image

SRC_PATH = r"C:\Users\vikky\.gemini\antigravity-ide\brain\dc3c011a-4236-4afd-8cc0-445b54bb29f7\.user_uploaded\media_1792820511730.jpg"

DEST_DIRS = [
    r"e:\MyProjects\NPWeb\frontend\public",
    r"e:\MyProjects\NPWeb\public",
    r"e:\MyProjects\NPWeb\admin-frontend\public",
]

ASSET_DIRS = [
    r"e:\MyProjects\NPWeb\frontend\src\assets",
    r"e:\MyProjects\NPWeb\src\assets",
    r"e:\MyProjects\NPWeb\admin-frontend\src\assets",
]

def main():
    if not os.path.exists(SRC_PATH):
        raise FileNotFoundError(f"Source image not found: {SRC_PATH}")

    img = Image.open(SRC_PATH).convert("RGBA")
    print(f"Loaded source image: size={img.size}, format={img.format}")

    # Ensure directories exist
    all_dirs = DEST_DIRS + ASSET_DIRS
    for d in all_dirs:
        os.makedirs(d, exist_ok=True)

    # 1. High-Res Logo (512x512 and original size)
    logo_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    logo_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
    fav_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    fav_16 = img.resize((16, 16), Image.Resampling.LANCZOS)

    # Save to public directories
    for d in DEST_DIRS:
        # Full/Standard logo.png
        img.save(os.path.join(d, "logo.png"), "PNG")
        logo_512.save(os.path.join(d, "logo-512.png"), "PNG")
        logo_192.save(os.path.join(d, "logo-192.png"), "PNG")
        apple_icon.save(os.path.join(d, "apple-touch-icon.png"), "PNG")
        fav_32.save(os.path.join(d, "favicon-32x32.png"), "PNG")
        fav_16.save(os.path.join(d, "favicon-16x16.png"), "PNG")
        fav_32.save(os.path.join(d, "favicon.png"), "PNG")

        # Multi-resolution ICO: 16, 32, 48
        ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
        img.save(os.path.join(d, "favicon.ico"), format="ICO", sizes=ico_sizes)
        print(f"Generated icons in {d}")

    # Save to src/assets for direct import in components
    for a in ASSET_DIRS:
        img.save(os.path.join(a, "logo.png"), "PNG")
        print(f"Saved logo in {a}")

    print("All favicon, logo, and touch icons successfully generated.")

if __name__ == "__main__":
    main()
