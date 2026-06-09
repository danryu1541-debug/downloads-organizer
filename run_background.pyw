from download_organizer.cli import main


if __name__ == "__main__":
    import sys

    sys.argv = [sys.argv[0], "run"]
    main()

