import React from "react";
import { useParams } from "react-router-dom";
import { SchemaRenderer } from "../renderer/SchemaRenderer";
import Layout from "../components/Layout";

export default function DynamicSchemaPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <Layout>
        <div style={{ padding: 24 }}>Missing page id</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SchemaRenderer pageId={id} />
    </Layout>
  );
}
