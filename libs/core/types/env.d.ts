type ApplicationEnvironmentType = import('./../src').AppEnvType;

declare namespace NodeJS {
  type ProcessEnv = ApplicationEnvironmentType;
}
