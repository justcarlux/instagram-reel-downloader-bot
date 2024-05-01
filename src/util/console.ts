import readline from "node:readline";

export async function input(question: string): Promise<string> {
    const rl = readline.createInterface(process.stdin, process.stdout);
    return await new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer || "");
        })
    });
}