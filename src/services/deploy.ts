export const DeployService = {
  deploy: async (repoUrl: string, commitMessage: string = "Update from Wealth Solution Admin") => {
    try {
      const response = await fetch("http://localhost:3000/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          commitMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Deploy request failed");
      }

      return await response.json();
    } catch (e: any) {
      console.error("Deploy Error:", e);
      // Check if it's a network error (server not running)
      if (e.message.includes("Failed to fetch") || e.name === "TypeError") {
        throw new Error("无法连接到本地代理服务。请确认已运行 'node proxy-server.js' 且端口为 3000。");
      }
      throw e;
    }
  }
};
