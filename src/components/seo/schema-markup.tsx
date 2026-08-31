"use client";

import React from 'react';

interface SchemaMarkupProps {
    data: any;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ data }) => {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
};

export default SchemaMarkup;
