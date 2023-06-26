import * as log from "https://deno.land/std/log/mod.ts";

// configure logger
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
  },

  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

// export default logger
export default log.getLogger();

