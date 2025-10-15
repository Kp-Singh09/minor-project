import ImageKit from 'imagekit';

export const getAuthToken = (req, res) => {
  // Initialize the SDK here, inside the function
  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  try {
    // Now generate the token
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.status(200).json(authenticationParameters);
  } catch (error) {
    res.status(500).json({ message: 'Could not get authentication token', error });
  }
};