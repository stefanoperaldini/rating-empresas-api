"use strict";

/** 
 * Middleware for role permission
**/

function checkRolePermission(...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1;

    // return a middleware
    return (req, res, next) => {
        if (req.claims && isAllowed(req.claims.role))
            next(); // role is allowed, continue to the next middleware
        else {
            res.status(403).send("Forbidden");
        }
    }
}

module.exports = checkRolePermission;
