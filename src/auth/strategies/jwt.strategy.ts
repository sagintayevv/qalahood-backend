// ─── jwt.strategy.ts ────────────────────────────────────────────────────────
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;

    console.log("JWT_SECRET present:", !!secret);
    console.log(
      "All env keys:",
      Object.keys(process.env).filter((k) => k.startsWith("JWT")),
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || "fallback_secret_change_in_production",
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
