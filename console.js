function getProfile(accessToken) {
    let accessToken = "BQCmpO6qXDr_Yio2EE3e20Y0HAQz_orZTID9J_Q3MSwlGIrhGklX9EAs_MADCr-EGZdDRRT_aYNPi7dlAYV8ksECTX1Ypwpo9B-zWIbh46xb_dKFdQw";
  
    const response = fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
  
    const data = response.json();
  }
  