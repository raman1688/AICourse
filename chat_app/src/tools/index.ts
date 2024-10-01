import OpenAI from "openai";

const openAI = new OpenAI();

function getTimeOfDay() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) {
    return "morning";
  } else if (hours < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}

function getOrderStatus(orderId: string) {
  console.log(`Checking order status for order ID: ${orderId}`);
  const orderAsNumber = parseInt(orderId);
  if (orderAsNumber % 2 === 0) {
    return "shipped";
  } else {
    return "pending";
  }
}

async function callOpenAIWithTools() {
  const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about time of day and status of order",
    },
    { role: "user", content: "What is the status of order 123?" },
  ];

  const response = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfDay",
          description: "Get the time of day",
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the status of an order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order",
              },
            },
            required: ["orderId"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  // decide if tool call is required
  const willInvokeTool = response.choices[0].finish_reason === "tool_calls";
  const toolCall = response.choices[0].message.tool_calls![0];

  if (willInvokeTool) {
    const toolName = toolCall.function.name;

    if (toolName === "getTimeOfDay") {
      const timeOfDay = getTimeOfDay();
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: timeOfDay,
        tool_call_id: toolCall.id,
      });
    }

    if (toolName === "getOrderStatus") {
      const orderId = JSON.parse(toolCall.function.arguments).orderId;
      const orderStatus = getOrderStatus(orderId);
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: orderStatus,
        tool_call_id: toolCall.id,
      });
    }
  }

  const secondResponse = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  console.log(secondResponse.choices[0].message.content);
}

callOpenAIWithTools();
