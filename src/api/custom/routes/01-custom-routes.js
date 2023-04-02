module.exports = {
  routes: [
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/logout",
      handler: async (ctx) => {
        ctx.cookies.set("token", null);
        ctx.send({
          authorized: true,
          message: "Successfully destroyed session",
        });
      },
    },
    {
      // Path defined with a regular expression
      method: "GET",
      path: "/email", // Only match when the URL parameter is composed of lowercase letters
      handler: async (ctx) => {
        await strapi.plugins["email"].services.email.send({
          to: "declan@hivefolio.gg",
          from: "declan@hivefolio.gg",
          replyTo: "declan@hivefolio.gg",
          subject: "Testing Sendgrid and Strapi",
          text: "Sendgrid email",
        });
        ctx.send("Email send!");
      },
    },
  ],
};

/*
async (ctx) {
    ctx.cookies.set("token", null);
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
  },
{
    "routes": [
        {
            "method": "GET",
            "path": "/email",
            "handler": "Email.index",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/logout",
            "handler": "Custom.logout"
        }
    ]
}
*/
