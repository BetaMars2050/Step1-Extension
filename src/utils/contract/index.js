import * as devContract from "./dev";
import * as proContract from "./pro";

const env = import.meta.env.MODE;

export default {
  development: devContract,
  production: devContract,
}[env];
