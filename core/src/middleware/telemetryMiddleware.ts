import { CloudContext } from "../cloudContext";
import { Middleware } from "..";
import { TelemetryOptions } from "../services/telemetry";
import { cpus, totalmem, freemem } from "os";

export const TelemetryServiceMiddleware = (
  options: TelemetryOptions
): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  const timeStart = new Date().getTime();
  const initialCpuAverage = CpuAverage();
  const usedMemBeforeChain = GetUsedMemory();

  context.telemetry = options.telemetryService;
  await next();

  const durationOfExecution = new Date().getTime() - timeStart;
  const finalCpuAverage = CpuAverage();
  const consumeCpuIdle = finalCpuAverage.idle - initialCpuAverage.idle;
  const consumeCpuTick = finalCpuAverage.tick - initialCpuAverage.tick;
  const memConsumedByChain = GetUsedMemory() - usedMemBeforeChain;

  const stats = {
    durationOfExecution,
    consumeCpuIdle,
    consumeCpuTick,
    memConsumedByChain
  };

  context.telemetry.collect("stats", JSON.stringify(stats));

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
