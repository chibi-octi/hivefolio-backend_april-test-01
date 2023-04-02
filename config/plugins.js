module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "myemail@protonmail.com",
        defaultReplyTo: "myemail@protonmail.com",
      },
    },
  },
  /* 'strapi-plugin-populate-deep': {
    config: {
      defaultDepth: 6, // Default is 5
    }
  }, */
  // ...
});
