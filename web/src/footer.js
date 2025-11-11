
import React, { useState, useEffect } from 'react';
import { Divider } from '@mui/material';
import Typography from '@mui/material/Typography';
const Footer = (props) => {
    return (<footer >
      <Typography align='center'>
          <p className="text-center text-muted">Copyright &copy; KING LONG ENGINEERING  Co. Ltd.</p>
          <p className="text-center text-muted">聯絡電話 082-335801#9.</p>
          <p className="text-center text-muted">Created by Md Infor Ltd. 2025 </p>
          <p className="text-center text-muted">本系統由鍆資訊有限公司維護</p>
      </Typography>
  </footer>)
}

export default Footer