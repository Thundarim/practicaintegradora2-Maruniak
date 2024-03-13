const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.login) {
        next();
    } else {
        res.redirect("/login");
    }
};
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        next();
    } else {
        res.status(403).send("Forbidden");
    }
};

router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
});

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    try {
        if (req.user) {
            req.session.user = req.user;
            req.session.login = true;
            res.redirect("/profile");
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error in GitHub authentication callback:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("login", {failureRedirect: "/api/sessions/faillogin"}, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Error de autenticación" });
        }
        if (!user) {
            return res.status(400).json({ status: "error", message: "Credenciales inválidas" });
        }

        req.session.user = {
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            email: user.email,
            role: user.role
        };

        req.session.login = true;

        res.redirect("/profile");
    })(req, res, next);
});

router.get("/faillogin", async (req, res ) => {
    console.log("Fallo la estrategia")
    res.send({error: "fallo nose porque, vos sabes?"});
});

router.get("/realtimeproducts", isAuthenticated, isAdmin, (req, res) => {
});

module.exports = router;
