from app import create_app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5002) 
    print("Server is running on http://localhost:5002")