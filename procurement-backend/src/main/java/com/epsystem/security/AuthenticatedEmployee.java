package com.epsystem.security;

import java.util.List;

/**
 * Set as the Authentication principal by JwtAuthFilter once a token is
 * verified. Controllers pull this with @AuthenticationPrincipal instead of
 * trusting an employeeId the client puts in the request body - that's the
 * whole point of moving to JWTs: identity comes from a signed token, not
 * from whatever the caller claims.
 */
public record AuthenticatedEmployee(Long employeeId, String username, List<String> roles) {
}
