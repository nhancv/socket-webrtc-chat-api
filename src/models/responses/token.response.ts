import {User} from "../../users/schemas/user.schema";

export interface TokenResponse {
    user: User | null,
    accessToken: String,
    expiresIn: String
}
