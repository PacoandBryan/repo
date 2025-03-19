from app import create_app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 
    print("Server is running on http://localhost:5000")