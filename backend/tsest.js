async function saveTokenv2(newTokens) {
    console.log("in/SAVETOKENS:", newTokens);
  
    try {
      const { codeVerifier, state, accessToken, refreshToken, url } = newTokens;
      let response;
  
      // Check for an existing entry with the given codeVerifier
      const codeVerifierEntry = await tokensModel.findOne({
        codeVerifier: codeVerifier,
      });
  
      console.log("codeVerifierEntry.state,");
      console.log(codeVerifierEntry);
  
      // Check for an existing entry with the given state
      let stateEntry;
      if (codeVerifierEntry) {
        stateEntry = await tokensModel.findOne({
          state: codeVerifierEntry.state,
        });
      }
      console.log("console.log({ codeVerifierEntry, accessToken, stateEntry });");
      console.log({
        state,
        refreshToken,
        url,
        codeVerifierEntry,
        accessToken,
        stateEntry,
      });
  
      // Use Case 1: Save new entry if codeVerifier doesn't exist and no accessToken is provided
      if (
        state &&
        !refreshToken &&
        url &&
        !codeVerifierEntry &&
        !accessToken &&
        !stateEntry
      ) {
        console.log("Excuting Case 1");
  
        const tokens = new tokensModel({ codeVerifier, state, url });
        response = await tokens.save();
        console.log("response");
        console.log(response);
      }
      // Use Case 2: Update by codeVerifier
      else if (
        codeVerifierEntry &&
        accessToken &&
        refreshToken
        // !stateEntry &&
        // !url
      ) {
        console.log("Excuting Case 2");
  
        //console.log("Updating by codeVerifier...");
        // response = await tokensModel.findOneAndUpdate(
        //   { codeVerifier },
        //   { $set: { ...newTokens } },
        //   { new: true, upsert: true }
        // );
  
        console.log("---codeVerifier");
        console.log(codeVerifier);
  
        const deleteOBJ = await tokensModel.findByIdAndDelete(codeVerifierEntry);
        console.log("----deleteOBJ----");
        console.log(deleteOBJ);
  
        newTokens.url = deleteOBJ.url;
        newTokens.state = deleteOBJ.state;
        console.log("----newTokens----");
        console.log(newTokens);
  
        newTokensSave = new tokensModel(newTokens);
        response = await newTokensSave.save();
  
        console.log("----response----");
        console.log(response);
      }
      // Use Case 3: Update accessToken and refreshToken by state
      else if (
        stateEntry &&
        accessToken &&
        refreshToken &&
        !codeVerifierEntry &&
        !url
      ) {
        console.log("Excuting Case 3");
        response = await tokensModel.findOneAndUpdate(
          { state },
          {
            $set: {
              accessToken,
              refreshToken,
            },
          },
          { new: true, upsert: true }
        );
      } else {
        console.log("Unhandled condition. Verify input data.", newTokens);
      }
  
      //console.log("Response:", response);
      return response;
    } catch (error) {
      //console.error("Error saving to database:", error.message);
      throw new Error("Error saving to database: " + error.message);
    }
  }
  