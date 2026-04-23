import { SetMetadata } from "@nestjs/common";

import { AUTH_SKIP_SERIALIZE } from "../constants/auth.constants";

export const SkipSerialize = () => SetMetadata(AUTH_SKIP_SERIALIZE, true);

