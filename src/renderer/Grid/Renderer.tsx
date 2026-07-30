import React, { JSX, memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Chip from "@mui/material/Chip";

import PomodoroIcon from "../../../resources/pomodoro.svg?asset";
import DatePickerInline from "./DatePickerInline";
import RecurrencePicker from "../Picker/RecurrencePicker";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { handleLinkClick, HandleFilterSelect, IsSelected } from "../Shared";
import { TodoObject, Filters, SettingStore, AttributeKey } from "@sleek-types";
import { ContextMenu, PromptItem } from "@sleek-types";
import { useAttributeContextMenu } from "../Shared/useAttributeContextMenu";

const { ipcRenderer } = window.api;

interface RendererComponentProps {
  todoObject: TodoObject;
  filters: Filters;
  settings: SettingStore;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
}

const RendererComponent: React.FC<RendererComponentProps> = memo(
  ({ todoObject, filters, settings, setContextMenu, setPromptItem }) => {
    const expressions: { pattern: RegExp; type: AttributeKey; key: string }[] =
      [
        {
          pattern: new RegExp(
            `t:${todoObject.tString?.replace(/\s/g, "\\s")}`,
            "g",
          ),
          type: "t",
          key: "t:",
        },
        {
          pattern: new RegExp(
            `due:${todoObject.dueString?.replace(/\s/g, "\\s")}`,
            "g",
          ),
          type: "due",
          key: "due:",
        },
        { pattern: /@(\S+)/, type: "contexts", key: "@" },
        { pattern: /(?:^|\s)\+(\S+)/, type: "projects", key: "+" },
        { pattern: /\bh:1\b/, type: "hidden", key: "h:1" },
        { pattern: /\bpm:(\d+)/, type: "pm", key: "pm:" },
        { pattern: /\brec:([^ ]+)/, type: "rec", key: "rec:" },
        {
          pattern: /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/\S+)/,
          type: "url",
          key: "url",
        },
      ];

    const { handleContextMenu } = useAttributeContextMenu({
      setContextMenu,
      setPromptItem,
    });

    const replacements: {
      [key: string]: (value: string, type: AttributeKey) => React.ReactNode;
    } = {
      due: (_, type) => (
        <DatePickerInline
          type={type}
          todoObject={todoObject}
          date={todoObject.due}
          filters={filters}
          settings={settings}
          onContextMenu={(e) =>
            todoObject.due && handleContextMenu(e, todoObject.due, type)
          }
        />
      ),
      t: (_, type) => (
        <DatePickerInline
          type={type}
          todoObject={todoObject}
          date={todoObject.t}
          filters={filters}
          settings={settings}
          onContextMenu={(e) =>
            todoObject.t && handleContextMenu(e, todoObject.t, type)
          }
        />
      ),
      contexts: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          onContextMenu={(e) => handleContextMenu(e, value, type)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      projects: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          onContextMenu={(e) => handleContextMenu(e, value, type)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      rec: (value, type) => {
        const [recOpen, setRecOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLDivElement>(null);

        const handleRecChange = (key: string, newValue: string) => {
          ipcRenderer.send(
            "updateTodoObject",
            todoObject.lineNumber,
            todoObject.string,
            "rec",
            newValue,
            true,
          );
        };

        return (
          <>
            <button
              onClick={() =>
                HandleFilterSelect(type, [value], filters, false, null)
              }
              onContextMenu={(e) => handleContextMenu(e, value, type)}
              data-testid={`datagrid-button-${type}`}
            >
              <Chip label="rec:" />
              <div
                ref={triggerRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setRecOpen(true);
                }}
              >
                {value}
              </div>
            </button>
            {recOpen && (
              <RecurrencePicker
                recurrence={value}
                handleChange={handleRecChange}
                open={recOpen}
                anchorEl={triggerRef.current}
                onClose={() => setRecOpen(false)}
              />
            )}
          </>
        );
      },
      pm: (value, type) => (
        <button
          className="pomodoro"
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          onContextMenu={(e) => handleContextMenu(e, value, type)}
          data-testid={`datagrid-button-${type}`}
        >
          <img src={PomodoroIcon} alt="Pomodoro" />
          {value}
        </button>
      ),

      hidden: () => null as React.ReactNode,

      url: (value) => (
        <a
          href={value}
          onClick={(event) => handleLinkClick(event, value)}
          target="_blank"
          rel="noopener noreferrer"
          title={value}
          data-testid={`datagrid-link-url`}
        >
          {value.length > 30 ? value.slice(0, 30) + "..." : value}
          <OpenInNewIcon />
        </a>
      ),
    };

    const options: Components = {
      p: ({ children }): JSX.Element | null => {
        const mappedChildren = React.Children.map(children, (child) => {
          if (typeof child !== "string") return child;
          let modifiedChild: React.ReactNode = child;
          // Step 1: Find all matches with their positions
          const allMatches: Array<{
            start: number;
            end: number;
            type: AttributeKey;
            value: string;
            pattern: RegExp;
          }> = [];

          expressions.forEach(({ pattern, type }) => {
            let match;
            const patternWithGlobal = new RegExp(
              pattern.source,
              pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g",
            );
            while (
              (match = patternWithGlobal.exec(modifiedChild as string)) !== null
            ) {
              // Use capture group (match[1]) if it exists, otherwise use full match (match[0])
              const captureGroup = match[1] !== undefined ? match[1] : match[0];
              allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                type,
                value: captureGroup,
                pattern,
              });
            }
          });

          // Step 2: Sort by position
          allMatches.sort((a, b) => a.start - b.start);

          // Step 3: Build result array with interleaved text and React elements
          const result: React.ReactNode[] = [];
          let lastEnd = 0;
          let elementIndex = 0;

          allMatches.forEach((matchInfo) => {
            // Add text before the match
            if (matchInfo.start > lastEnd) {
              result.push(
                (modifiedChild as string).substring(lastEnd, matchInfo.start),
              );
            }

            // Add the match as a React element
            elementIndex++;
            result.push(
              <span
                key={`${matchInfo.type}-${matchInfo.value}-${elementIndex}`}
                className={
                  IsSelected(matchInfo.type, filters, [matchInfo.value])
                    ? "selected filter"
                    : "filter"
                }
                data-todotxt-attribute={matchInfo.type}
              >
                {replacements[matchInfo.type](matchInfo.value, matchInfo.type)}
              </span>,
            );

            lastEnd = matchInfo.end;
          });

          // Add any remaining text after the last match
          if (lastEnd < (modifiedChild as string).length) {
            result.push((modifiedChild as string).substring(lastEnd));
          }

          modifiedChild = result;
          return modifiedChild;
        });
        return mappedChildren ? <>{mappedChildren}</> : null;
      },
      a: ({
        children,
        href: hrefFromDestructure,
        ...props
      }): JSX.Element | null => {
        if (!children) return null;
        const childrenStr =
          typeof children === "string" ? children : String(children);

        // Use href from destructure first, then from props, then fall back
        // Treat empty strings as missing - trim whitespace and use if available
        const href =
          hrefFromDestructure?.trim() || props.href?.trim() || childrenStr;

        const match = /([a-zA-Z]+:\/\/\S+)/g.exec(childrenStr);
        const maxChars = 40;
        const truncatedChildren =
          childrenStr.length > maxChars
            ? childrenStr.slice(0, maxChars) + "..."
            : childrenStr;

        const link = (
          <a
            {...props}
            href={href}
            onClick={(event) =>
              handleLinkClick(event, match ? childrenStr : href || childrenStr)
            }
          >
            {truncatedChildren}
            <OpenInNewIcon />
          </a>
        );

        return link;
      },
    };

    const preprocessBody = (body: string): string => {
      // Skip processing if text already contains markdown links
      // (contains patterns like [text](url))
      if (body.includes("](")) {
        return body;
      }

      // Convert custom protocol URLs to markdown link syntax
      // Match patterns like joplin://..., cbthunderlink://..., file://...
      const customProtocolRegex = /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s[]()]+)/g;
      return body.replace(customProtocolRegex, (match) => {
        return `[${match}](${match})`;
      });
    };

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={options}>
        {preprocessBody(todoObject.body)}
      </ReactMarkdown>
    );
  },
);

RendererComponent.displayName = "RendererComponent";

export default RendererComponent;
