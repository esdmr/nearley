/**
 * Represents parse failure. Should be returned by the postprocess. States
 * with this as their data will be ignored.
 */
export const fail = Symbol('nearley.fail');
