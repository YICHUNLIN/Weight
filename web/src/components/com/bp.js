import React, { } from 'react';
import {Link, Breadcrumbs, Typography} from '@mui/material';

export const SingleLayerBp = ({first, current}) => {
    return <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href={first.href}> {first.name} </Link>
        <Typography color="text.primary">{current}</Typography>
    </Breadcrumbs>
}