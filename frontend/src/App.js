function App() {
  const authLink = `${process.env.REACT_APP_BACKEND_LINK}/authLink`;
  console.log(authLink);
  return (
    <div className="App">
      <a href={authLink}>Login</a>
    </div>
  );
}

export default App;
