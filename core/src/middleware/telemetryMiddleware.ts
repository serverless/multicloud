import { cpus, totalmem, freemem } from "os";
import { TelemetryOptions } from "../services/telemetry";
import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";

/**
 *
 * @param options Options for Telemetry
 */
export const TelemetryServiceMiddleware = (options: TelemetryOptions): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    const initialCpuAverage = CpuAverage();
    const usedMemBeforeChain = GetUsedMemory();

    context.telemetry = options.telemetryService;
    await next();

    const finalCpuAverage = CpuAverage();
    const consumeCpuIdle = finalCpuAverage.idle - initialCpuAverage.idle;
    const consumeCpuTick = finalCpuAverage.tick - initialCpuAverage.tick;
    const memoryConsume = GetUsedMemory() - usedMemBeforeChain;

    const stats = {
      consumeCpuIdle,
      consumeCpuTick,
      memoryConsume
    };

    context.telemetry.collect("stats", stats);

    if (options.shouldFlush) {
      context.telemetry.flush();
    }
  };

const CpuAverage = () => {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0,
    totalTick = 0;
  var myCpus = cpus();

  //Loop through CPU cores
  for (var i = 0, len = myCpus.length; i < len; i++) {
    //Select CPU core
    var cpu = myCpus[i];

    //Total up the time in the cores tick
    totalTick += cpu.times.user;
    totalTick += cpu.times.nice;
    totalTick += cpu.times.sys;
    totalTick += cpu.times.idle;
    totalTick += cpu.times.irq;

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return { idle: totalIdle / myCpus.length, tick: totalTick / myCpus.length };
};

const GetUsedMemory = () => {
  return totalmem() - freemem();
};
