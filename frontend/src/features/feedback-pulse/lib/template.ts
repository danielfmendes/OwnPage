export const INITIAL_LOAD_JSON = [
    {
        source: "Discord",
        author: "dev_jane",
        content: "The PDF export function crashes every time I select 'Last 30 Days'. It works fine for 'Last 7 Days'."
    },
    {
        source: "Twitter",
        author: "@startup_founder",
        content: "Loving the new analytics dashboard! However, the mobile view is a bit squashed on iPhone Mini."
    },
    {
        source: "Support",
        author: "enterprise_corp",
        content: "CRITICAL: None of our admin users can log in. Getting 403 Forbidden errors since the last update."
    },
    {
        source: "Discord",
        author: "bug_hunter_x",
        content: "Typo in the settings menu: 'Notifcations' is missing an 'i'."
    },
    {
        source: "GitHub Issue",
        author: "oss_contributor",
        content: "Memory leak detected in the websocket connection when re-connecting."
    },
    {source: "Community Forum", author: "new_user_1", content: "How do I reset my API key? I cannot find the button."},
    {source: "Email", author: "vip_client", content: "We need an SLA report generated for last month by EOD."}
];

export const SINGLE_TEMPLATE = JSON.stringify({
    source: "Discord",
    author: "dev_user_99",
    content: "The API throws a 500 error when I try to export PDF reports.",
}, null, 2);