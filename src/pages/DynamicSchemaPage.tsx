import React from "react";
import { useParams } from "react-router-dom";
import SchemaPage from "./SchemaPage";

export default function DynamicSchemaPage() {
  // SchemaPage now handles the missing id case internally
  return <SchemaPage />;
}
