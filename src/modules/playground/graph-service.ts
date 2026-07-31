import { db } from "@/lib/db";
import {
  StartupIdeaInput,
  NodeExecutionResult,
  executeNode1,
  executeNode2,
  executeNode3,
  executeNode4,
  executeNode5,
} from "./node-executor";

export async function executeSingleNode(nodeId: number, input: StartupIdeaInput): Promise<NodeExecutionResult> {
  switch (nodeId) {
    case 1:
      return executeNode1(input);
    case 2:
      return executeNode2(input);
    case 3:
      return executeNode3(input);
    case 4:
      return executeNode4(input);
    case 5:
      return executeNode5(input);
    default:
      throw new Error(`Invalid Node ID: ${nodeId}`);
  }
}

export async function executeFullGraphPipeline(input: StartupIdeaInput) {
  const node1 = await executeNode1(input);
  const node2 = await executeNode2(input);
  const node3 = await executeNode3(input);
  const node4 = await executeNode4(input);
  const node5 = await executeNode5(input);

  const nodeOutputs = {
    node1: node1.data,
    node2: node2.data,
    node3: node3.data,
    node4: node4.data,
    node5: node5.data,
  };

  // Persist execution in DB
  const execution = await db.playgroundGraphExecution.create({
    data: {
      title: input.title,
      category: input.category,
      currentStage: 5,
      problemStatement: input.problemStatement,
      targetAudience: input.targetAudience,
      proposedSolution: input.proposedSolution,
      selectedFaculty: input.selectedFaculty ? input.selectedFaculty : [],
      selectedAlumni: input.selectedAlumni ? input.selectedAlumni : [],
      tamSamScore: node3.data.tamSamScore,
      viabilityScore: node3.data.viabilityScore,
      nodeOutputs,
      status: "completed",
    },
  });

  return {
    executionId: execution.id,
    nodeOutputs,
    summary: {
      tamSamScore: node3.data.tamSamScore,
      viabilityScore: node3.data.viabilityScore,
      matchedFacultyCount: node2.data.matchedFaculty?.length || 0,
      matchedAlumniCount: node2.data.matchedAlumni?.length || 0,
    },
  };
}

export async function getSavedGraphExecutions() {
  const executions = await db.playgroundGraphExecution.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return executions.map((e) => ({
    ...e,
    selectedFaculty: Array.isArray(e.selectedFaculty) ? e.selectedFaculty : [],
    selectedAlumni: Array.isArray(e.selectedAlumni) ? e.selectedAlumni : [],
    nodeOutputs: e.nodeOutputs || null,
  }));
}
