import {
  Root,
  // Content is deprecated, instead use union of specific types
  Blockquote,
  Break,
  Code,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  HTML,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  Paragraph,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
  ThematicBreak,
  YAML,
  Parent,
} from "mdast"

export interface NodeSelector {
  type: string
  [key: string]: any
}

export interface NodeCreationOptions {
  type: string
  content: string
  [key: string]: any
}

export interface NodeUpdateOptions {
  content?: string
  [key: string]: any
}

export type MdastNode =
  | Root
  | Blockquote
  | Break
  | Code
  | Definition
  | Delete
  | Emphasis
  | FootnoteDefinition
  | FootnoteReference
  | Heading
  | HTML
  | Image
  | ImageReference
  | InlineCode
  | Link
  | LinkReference
  | List
  | ListItem
  | Paragraph
  | Strong
  | Table
  | TableCell
  | TableRow
  | Text
  | ThematicBreak
  | YAML

// Define a subset of MdastNode that has children
export type ParentNode = Extract<MdastNode, { children: any[] }>

export type NodeMatcher = (node: MdastNode) => boolean
