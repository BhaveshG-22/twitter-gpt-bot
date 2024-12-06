import { useState } from "react";
 
function App() {
  const [authLink, setAuthLink] = useState(
    process.env.REACT_ENVIRONMENT === "PROD"
      ? `${process.env.REACT_APP_BACKEND_LINK}/authLink`
      : `${process.env.REACT_APP_DEV_BACKEND_LINK}/authLink`
  );

  //getAuth Link and redirect to callback page
  const getAuthLink = async () => {
    try {
      await fetch(authLink).then(async (resp) => {
        const jsonResponse = await resp.json();
        setAuthLink(jsonResponse.link);

        console.log(await jsonResponse.link);
        window.location.href = await jsonResponse.link;
      });
    } catch (error) {
      console.error("Error Using Fetch:" + error);
    }
  };

  return (
    <div className="App">
      <button
        onClick={() => {
          getAuthLink();
        }}
      >
        Login
      </button>
    </div>
  );
}

export default App;
