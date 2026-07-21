import React, { JSX, memo } from "react";
import reactStringReplace from "react-string-replace";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import PomodoroIcon from "../../../resources/pomodoro.svg?asset";
import DatePickerInline from "./DatePickerInline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { handleLinkClick, HandleFilterSelect, IsSelected } from "../Shared";
import { TodoObject, Filters, SettingStore, AttributeKey } from "@sleek-types";

interface RendererComponentProps {
  todoObject: TodoObject;
  filters: Filters;
  settings: SettingStore;
}

const RendererComponent: React.FC<RendererComponentProps> = memo(
  ({ todoObject, filters, settings }) => {
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
      ];

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
        />
      ),
      t: (_, type) => (
        <DatePickerInline
          type={type}
          todoObject={todoObject}
          date={todoObject.t}
          filters={filters}
          settings={settings}
        />
      ),
      contexts: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
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
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      rec: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          data-testid={`datagrid-button-${type}`}
        >
          <Chip label="rec:" />
          <div>{value}</div>
        </button>
      ),
      pm: (value, type) => (
        <button
          className="pomodoro"
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          data-testid={`datagrid-button-${type}`}
        >
          <img src={PomodoroIcon} alt="Pomodoro" />
          {value}
        </button>
      ),

      hidden: () => null as React.ReactNode,
    };

    const options: Components = {
      p: ({ children }): JSX.Element | null => {
        const mappedChildren = React.Children.map(children, (child) => {
          if (typeof child !== "string") return child;
          let modifiedChild: React.ReactNode = child;
          let index = 0;
          expressions.forEach(({ pattern, type }) => {
            modifiedChild = reactStringReplace(
              modifiedChild as string,
              pattern,
              (match) => {
                index++;
                return (
                  <span
                    key={`${type}-${match}-${index}`}
                    className={
                      IsSelected(type, filters, [match])
                        ? "selected filter"
                        : "filter"
                    }
                    data-todotxt-attribute={type}
                  >
                    {replacements[type](match, type)}
                  </span>
                );
              },
            );
          });
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
      const customProtocolRegex = /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s\[\]()]+)/g;
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
