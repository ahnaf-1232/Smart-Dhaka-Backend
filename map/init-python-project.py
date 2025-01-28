import os

# Define the project structure without specifying a root directory
def get_project_structure():
    return [
        "data/raw",
        "data/processed",
        "notebooks",
        "src/data_processing",
        "src/features",
        "src/models",
        "src/utils",
        "tests",
        "logs"
    ]

# Define base files to be created in the root and subdirectories
def get_base_files():
    return [
        ".env",
        ".gitignore",
        "requirements.txt",
        "setup.py",
        "README.md",
        "src/config.py",
        "src/main.py",
        "tests/__init__.py",
        "src/__init__.py"
    ]

def create_project_structure():
    # Get the project structure and files
    project_structure = get_project_structure()
    base_files = get_base_files()
    
    # Create directories
    for folder in project_structure:
        os.makedirs(folder, exist_ok=True)
        print(f"Created directory: {folder}")
    
    # Create files
    for file in base_files:
        with open(file, "w") as f:
            f.write("")
        print(f"Created file: {file}")

if __name__ == "__main__":
    create_project_structure()
