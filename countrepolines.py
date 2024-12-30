import subprocess
import os

def get_tracked_files():
    """
    Returns a list of all Git-tracked files in the current directory.
    """
    # Execute `git ls-files` to list tracked files
    result = subprocess.run(["git", "ls-files"], capture_output=True, text=True)
    if result.returncode != 0:
        print("Error running git ls-files:", result.stderr)
        return []

    # Split the output by newlines to get individual file paths
    files = result.stdout.strip().split("\n")
    # Remove any empty strings (in case of trailing newlines)
    return [f for f in files if f.strip()]

def count_lines_in_file(file_path):
    """
    Counts the number of lines in a single text file.
    """
    try:
        with open(file_path, encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception as e:
        print(f"Could not read {file_path}. Error: {e}")
        return 0

def main():
    tracked_files = get_tracked_files()
    total_lines = 0

    for file_path in tracked_files:
        total_lines += count_lines_in_file(file_path)

    print(f"Total lines in tracked files: {total_lines}")

if __name__ == "__main__":
    main()
