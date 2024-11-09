import { Context, type MiddlewareFn } from "./deps.deno.ts";

const METHODS = new Set([
    "sendMessage",
    "sendPhoto",
    "sendVideo",
    "sendAnimation",
    "sendAudio",
    "sendDocument",
    "sendSticker",
    "sendVideoNote",
    "sendVoice",
    "sendLocation",
    "sendVenue",
    "sendContact",
    "sendPoll",
    "sendDice",
    "sendInvoice",
    "sendGame",
    "sendMediaGroup",
    "copyMessage",
    "copyMessages",
    "forwardMessage",
    "forwardMessages",
    "sendChatAction",
]);

export function autoThread<C extends Context>(): MiddlewareFn<C> {
    return async (ctx, next) => {
        const chat_id = ctx.chat?.id;
        const message_thread_id = ctx.msg?.message_thread_id;
        const is_topic_message = ctx.msg?.is_topic_message ?? false;
        if (
            chat_id !== undefined &&
            message_thread_id !== undefined &&
            is_topic_message
        ) {
            ctx.api.config.use(async (prev, method, payload, signal) => {
                if (
                    METHODS.has(method) &&
                    "chat_id" in payload && payload.chat_id === chat_id &&
                    !("message_thread_id" in payload)
                ) {
                    Object.assign(payload, { message_thread_id });
                }
                return await prev(method, payload, signal);
            });
        }
        await next();
    };
}
