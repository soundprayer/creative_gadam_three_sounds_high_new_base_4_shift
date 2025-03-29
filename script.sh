#!/bin/bash

# Set base directories
BASE_DIR="assets/styles"
COMPONENTS_DIR="$BASE_DIR/components"

# Create directories
mkdir -p "$COMPONENTS_DIR"

# Create empty CSS files
touch "$BASE_DIR/main.css"
touch "$BASE_DIR/base.css"
touch "$BASE_DIR/layout.css"
touch "$BASE_DIR/animations.css"

touch "$COMPONENTS_DIR/modal.css"
touch "$COMPONENTS_DIR/controls.css"
touch "$COMPONENTS_DIR/sliders.css"
touch "$COMPONENTS_DIR/sound-selector.css"

echo "✅ CSS directory structure created with empty files!"
