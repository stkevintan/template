/**
 * Created by kevin on 16-4-12.
 */
'use strict'

const app = require('express')();
const fs = require('fs');
const path = require('path');

module.exports = (opts)=> {
    const baseDir = path.join(__dirname, opts.dest);
    app.get('/map', (req, res)=> {
        const dir = path.join(baseDir, req.query.dir || '');
        const files = fs.readdirSync(dir);
        let result = '<ul>';
        files.forEach((file)=> {
            if (!fs.lstatSync(path.join(dir, file)).isDirectory()) {
                result += `<li><a href="${file}" target="viewbox">${file.substr(0, file.lastIndexOf('.')) || file}</a></li>`;
            // } else {
            //     result += `<li><a href="?dir=${file}" >${file} -></a></li>`;
            }
        });
        result += '</ul>';
        result += `<div class="main"><div class="mark"><</div><iframe name="viewbox"></iframe></div>`;
        //styles
        result += `
    <style>
        body{
            margin:0;
            height:100%;
            overflow:hidden;
        }
        *{
            box-sizing:border-box;
        }
        ul{
            list-style:none;
            display:block;
            padding-left:0;
            margin:0;
            width:220px;
            height:100%;
            overflow:auto;
        }
        .main{
            position:absolute;
            top:0;
            left:220px;
            width:calc(100% - 220px);
            height:100%;
            background:#fff;
            box-shadow: -2px 0 3px rgba(0, 0, 0, 0.35);
            transition:all 0.2s ease-in;
        }
        .main.expanded{
            width:100%;
            left:0;
        }
        iframe{
            width:100%;
            height:100%;
            border:none;
        }
        .mark{
            position:absolute;
            cursor:pointer;
            left:0;
            top:50%;
            padding:0 10px;
            line-height:30px;
            height:30px;
            margin-top:-15px;
            background-color:rgba(0,0,0,0.42);
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.18);
            opacity:0.4;
            color:#fff;
            transition:opacity .2s ease-in;
        }
        .mark:hover{
           opacity:1;
        }
        ul a{
            text-decoration:none; 
            color:#444;
            display:block;
            padding: 0 40px 0 20px;
            position: relative;
            font-size: 14px;
            line-height: 32px;
        }
        a:hover{
            color:#444;
            background: #f2f4f7;
        }
        a.active{
          color: #fff;
          background: #82c547;
        }
    </style>
    <script>
        var ul = document.querySelector('ul');
        var a = ul.querySelectorAll('a');
        var main = document.querySelector('.main');
        var mark = main.querySelector('.mark');
        var iframe = main.querySelector('iframe');
        
        mark.addEventListener('click',function(e){
            main.className = 'content' + (mark.innerText === '<'?' expanded':'');
            mark.innerText = mark.innerText === '<'?'>':'<';
        });
        window.onload=function(){
            iframe.src=(window.location.hash.substr(1)||a[0].innerText||'index') +'.html';
        }
        iframe.onload = function(){
            var win = iframe.contentWindow||iframe.window;
            if(/^Cannot GET/.test(win.document.body.innerText)){
                //fix 404 bug
                win.location.reload();
                return;
            } 
            var name = win.location.pathname.match(/[^\/\.]+/)[0];
            for(var i=0;i<a.length;i++)a[i].className = a[i].innerText === name?'active':'';
            window.location.hash = name;
        }
    </script>
    `;
        res.send('<!DOCTYPE html>' + result);
    });

    return app;
};
