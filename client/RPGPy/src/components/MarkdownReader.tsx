
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownReader({content}:{content:string}){
    return (
        <div >
            <ReactMarkdown remarkPlugins={[remarkGfm]} >
                {content}
            </ReactMarkdown>
        </div>
    )
}