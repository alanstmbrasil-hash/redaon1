/* ============================================================
   RedaON · Portal do Aluno · BASE COMPARTILHADA · v6-5 (16/09/2026)
   v6-5: ícones do menu, barra, gavetas e linha .pgHead passam a ser Fluent Emoji
   (Microsoft, MIT) pré-desenhados em WebP e embutidos — mesmo visual em todo aparelho,
   sem filtro de desfoque. Avisos (toast) seguem com emoji de texto até a 2ª leva.
   v6-1: Aparência sai do menu Mais e da sidebar (decisão A6 — tema em
   dois lugares: sol/lua do topo + tela Configurações). Ícones/textos
   de tema remanescentes atualizam só se existirem no DOM.
   Injeta o esqueleto (sidebar, header, barra, gavetas, toast)
   e concentra tema, navegação e utilidades.
   Cada tela chama: montarEsqueleto({ ativo, titulo, icone, versao, sino })
   ============================================================ */

/* ─── Ícones Fluent Emoji (v6-5) ───
   Fluent Emoji © Microsoft Corporation · licença MIT · github.com/microsoft/fluentui-emoji
   SVG "Color" pré-desenhado em WebP (72px; estudante 96px) — decorativos (alt vazio). */
var FE_ICONES = {
  calendario:'UklGRqwEAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSNUAAAABgGzbdtrmPXOSMv//V9GcuZISPZlKgvqWRl0RMQH082fm7ENmJM7yoqzqummauiwy5lTHl1fGaKWeP1W91/ru/Gx9VuWcRPXjxIennXmZxd0MI+Bwv1lnMWYENTt1FmZGWLNdZSFPI/DzesEBA9Jw1GQ+GaGXG4VvwOr3Kt8IrhqPRTMLzxLNrnscmvN1cGtfRvNVSOExaJo9Ck3Rvy/0T0H/XFZoxkdoqwDBaumrsCHkkDoKlh5IwsjiCMXaHkQoXlqEwVFS106tc5RcxLaTFRH6WwUAVlA4ILADAACQFACdASpIAEgAPj0WikMiISEYXY2oIAPEsQBiawyun0pkk4t30AdAH7Let76FPJA6y/0AP2M9Mr9cvhK/bH9kPZs/+h3gaTWZ15kEwAVNUpKm1c6m4Y34oxTHFM17RbyspmYf17HBO7TuEN6k34F2eFbFo7diMGsOEO3frjWKCWDTntXcpcLRZsLEEpkWX0VR8bFxGB/tWJ6CErjnh8T9Xv6aCvHc8FN+SNVRwAD+/51xx5A7jmEdoaqDuIc19cDFCfvauPEIe1m4zI84eF6Zs1+ZT+P9x/jz34MFi/98/UPwQyOG/ugrtRWhIfnx+dKGyfjJ9CRxQVdOEGCLd7BFJVatTyLUzxF5oXUup7lunJqUQCAGeJewPQoAcQk3fI+SrkH2dY8DFrJkCtsfmnkNNeYdt/kWSjIW58jI/n9NugCtPJ5qb3r32hYgK9avx5VZW4iXFuL+nNVAjceTGsxCKxbchO6ZIlAeX8jCUADPhiSAQnWgdUFDS9u1X1v3v+AoP763/xOfHT5Onrx+Miig/mu/735oADEsuZ/ii0wC5FJaDL+uriyt3XP+rnnCpFosL9vA133XzF15iEey5Lr9ZJwhi/8g16NFmzhtQySI2/mejrJ6aHPnfnP/hW226ev6DhUu3DOlJe7ui/zqTgYWIK11y44W+CN1ALjQ7OAlcBCS2thSFO4CUPfcCyAg1wwh+4B/YRGCicloPQPTqfM2aCCNMH6k9llponeWAilptLwzgEBhOvDjZ3enPuJ8Vb89kfBz+Ps45KcIKQFrln7SMD+JEcOB6FsZkJLyGX1UY9YwKK0MTIGt317AMitjsG7r9dlqci8rDGSh8uSomVCqysnkdeT+HbyoXI2HM0PypP/8TFZBD/g1nRjXpMpeo8fzErlcAecnm/oiJ3RbWRcXqTAYbeCY5FwNTG3kgJl4g11B/lH64Ksn/jLr7Wnal4AHGl6On1DpiZCiwTespqz5m7KSzAT3Uv89PPzXVsv1sHF0333iIE3Wx6pORpL3xfk9469FQOyK0dr5jz9e+zV6AJtd3r18e44gFRqdWcuGFFMjQ+gtZz/e5Mh9AdH8SWIen35U8gaGa6XV93f+P5I7YEvrQRuAaaSLuUcucGMcRnDWe8iLMnQ+AeG3BN63MUO4/AmOSaiLhcquw99KB///mGnjGbxxdHHgx1izam+UsoPRQbhE2ClaTJzmoUjegE47mfJHfsJDtzu0eh4Vqounq0g0M8fI3k//qeqgFDAAAA==',
  camera:'UklGRoADAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSLcAAAABcBvbtqq8QpAqKMDjH5OSOZFlf0gdckIqoAQvwKUC/e6C33m4z0TEBKC/ssRx33ncBNCNLb05eZbQBpzGlb2ILKyNwT/jNleqzoOgpL65YrMC0TZXbQDIzZUD6jej8bTUNJlnaAqjaMAMkcLIcKKsAiabK6+eGl5b5maQ/z/611Y6FeBYhqbWRymKphmWF0RZUXUTpgvUGiMtqkrilGNz5c5TqHtdPQS0jK9pYoUgZI9frR29SgEAVlA4IKICAAAwDgCdASpIAEgAPj0ci0QiIaESmgaoIAPEs4BpMvdaww/5TMJtl5MY/1gOnIiZtEptKSQIE6J02/Rmad5I5iCTGKwhhrTjr+d7GGp+JPb61hQcnlblfwGYSn4XHRk4OzCYu1Rg/oDfBW60iQQMf6cVtuZ7RVkOhedooAD+/qU2Aav9mIbo5aq1p4FnEv+zBwuNz+OtdGOVGw9RuD/+zoUfGOHFvOcbKy0X2rLBM9nE//udZz7NPnXWti2IbWCAGNb/H/w9n///2Jq8JEGizIHO3GawEMXMnnukK7qR8EqBsBap/UlDNw/0bfVyt4w6voQhia7sX5uWQ3AyGDfNumzWAlU8YmjTlZf2rZyy0/BMInzCcarE9uJlQHiayZ45Ts4gar7pW1y2HhgOPslTE1xRN4FzbpS4YYUYOQVaCq+w0ORda+h4qP6svolnrPaHYHd39NC2GEYMrKTzK7YRD4+pZYGt+rQegC19mbSpBgpk3u6RFtrw1qG9hODguHcvybGZj3Kpqulv2b43WNjdX0LuGYDzeAYEZgygflHfs+04uNu7XBf+iofg+80SzD14Kj1JaCQy9b7G17VH1pp1fGNH3HlAQWaR6KXwPrJUOsKAp+WK8a5eEF/t8/Vpv0vOAFbegKVdgqEiPl9ckAIfDQTgwBCLaV4TX1f4fQen3POs/mPUyLDA7CtKLXlSlYErin1uLarDwKm+yaH2JmSU9IdVLopcWnzytsoL/Fld9nq8F9GB7feLi96khhM0d+aI2utV7/77P1uDvYOrb34f3vV4T+td2DjsXPGCN/kzAdPPFBsSKKhm6xxa+/mk0H0BLlWIIb4nAUd4FzwAO7fuBlXDZZxshAWNAASsF5Iiqov/HPKdom/12YVJ9u8ehhnoMAAAAA==',
  casa:'UklGRmIFAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSEMBAAABj8KmjSRJV9W9T3YTHX+4ByEi8hneUUpN83E1gNJIWE7iKerh7xLPATachKIIhCCGH/0T71Ehov8TgGMi+mAAkkgbGmgzQ/sLuAOybNumnXXx7NZLWjY+QX3nS23btm20+HAR3HMf9onTiIgJwE+0N8XGh5L6+ro0HhTlAsBMkjnKwvdRm80unmyw8gphqCWZE8YBGIvOdDAjSWXy0Uj3wKxKIs46N76EEjesAi+cpQmQk8sjJgD+ZBBYIoiLLPIyN0RenM3y4mSBF4eLvDhY48W+zgsFP+MuE4pCC+esLhBfuTHSG5R3IRLhdyO7RmjpV4DxPRLLZ8BGwy0DEJwhVSChLx8hdhoKVG7Ek4b66Yjv/xpiPIptJIJ3sRSnukEzG3WFpiq8EghfTpiotIL06g6rHrRDHSwLHUESRCEaYn1rAgBWUDgg+AMAANAVAJ0BKkgASAA+PRiKQyIhoRcJdtggA8S2AGSG7T8r1f7uXmi11+l/hHkYjVdkv7n7ju1h4jX+Y6p/mA/XD9Sfdt9Bn+j9QD+6/7H0ZvYd9Cj9ZvSw/ZD4L/3O9G7//mECaMROsC94ifB9L+yK3h2VtlDLhrzzVSYQBkf+EL/GvNQg9tPwzvYtWVfTYMCS2XfHGScFriXbDY+i4F/nAMbOTNTx81/VbqDgIEHNVup8YGJcbILagAD+/d1f/+sq//1i9//6nCnP+uaCxpuKmTsNP5Ucr4pzjJHuAFFH6Ekzr3PQSYuddoQJ/Noks1/2bTUMG1/C8NS+LiL3/L//Fl/zfjFrg7g4DYYPKS6XiS8vitmfuN45xgrM7Ucc9MLXEwmR6HmtWfnhK58uFLeAc0DsQ3er/6uPKMZRWW+EGH6PBuClqvIaeMZoho7ofM3H7KnXmcOIlKXO4pzbtfo6cDPDkWAG61DQCxHZ0jlt/LBUnL/+DZ/Hu4Pchm1kpifIY8uu4B2O7byQuKb/jAa5BE+BYQFh256L9rYmjjCnjYXrWnZJ6taA7Nw4woYk6o2yOPfjlZkIBNB4bVErlUz1stFqwzYe1OKNU3w/OGxP0USZ9Cqyw8Vm8hlOrw4UNUnLU9crxwDKK7OwotaOkB9gd4snnSKcixM1Y5jT/++WofTB4FR3kRCvCx/7MKgf57tDJvdY/0uUBmOS3hud7S9kXZZXqMxC7U77YVH3BSjTnJdm7z/8JTfCD+Qxq3r1V1ebIObtWDYiqJekpHnGx/Guxe+ePDlIz51f3TH2acMp6s9LY21V/z3hYgFQXdqvmdZJXIK/HjM5fr4MHj4sBmV3OAvqVntld/gcRvnrcWgrXPqxWIICvW27U/BtqKOwKcfgBp81YmsfnAv44uTN8M3ZTrrIOKT8sJLpbLaX/v14B5JrMIAYZywUb1Zf4PPglC9YAW2L0VQ4Tf1zLlOJ/8WZyP7NFbESSqCMTqoAYAcfZlfd+gyPk+CUvykvnLAGdLI/n8xb5dHpoW6F/JnOdVynHLv63kZcqNkaVfeLL54NPm22xJ/EM4CIWpUfw+SNxDL9ergO8QEeFI+ngMWEUfWq3PWjXFEsZW9akkzhsucSHIDsNgX0WBtmBgAiJIrd6YOjLQt5zPICF2Q3aNrWL41G4rMgSvW7VKI8zkf5dY+9u0oZSXIzKqpfC+lzgl7VzGP9JB///e5smTb6GgC46scRIAYrSQt9z3+E14AJnV3M1i1fAhuZBZ6lZdzrPcjRkKGX/yQhaX/8JulUgLCe/LjOvWyd+CXG2SDd26WGtOjaXgzBX7DsodEilHxXgVL1L44hmiikEAQygAAA',
  claquete:'UklGRmgEAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSCkBAAABkGzbtmlX60OiP1DVLpll27Zt27ZtJyX72bZxsB5P9t6xWouICYDzTcP4ubk6w8NWdv89/tvjEFU9+4mSFQ9H5jMBD1zPXvjNn0j0HluqEx9FJK7CjGrXSwGpBrHR/FRA6v30ht+JyOBWvjadyic8svjASQFoWq3wyOKnRWegmr/+GRn8vpMElI0/Iv1n4ylAX+kbUn4/GwpsNiDNb+uhwO4CMfFVrwEwPUPm06IeMF9zIOHTogscShtJ4rM+ezi0Cv971ucIh/s+Is7EaMHht8nRgtNpDR7KARIzh2PuPKjjzd88x/GCRJ6TyAsSeY7juJ8ry8vLyw0kNvFQLpGYufal8MjwOxzRJGD/MNzXIiIzxd6oFpC29vLy8sqrZNDFwsLCwgnOVgEAVlA4IBgDAACQEACdASpIAEgAPj0YikOiIaEXCXaQIAPEoAzw0aPM4CWcL88PozMlH/cnBQPwAgQI+Z3BviEvLmWwcCVkEk756UxXFSA0A+GkG7easpIF/vTuI8VMXxDRBopwhsMq7ZNFPNNBsDI0q0sde/FyBD44SdyeaWJq6yudQSWEP2fvajDLHP8mSlbOLhwvlcAA/v4PH//mm//80Ff/+YkcPW2D+aL8X4b8fsXmWMdvC3jldjN6PGZdZWAaBJHhj1uu6Z46hydjm8wVM0vpsDLPM3T92pI2d5bc9/VYFp7V/FOgDMgpNVANM6D1ATeeHC+zCKli6aTH3P5KgdYm1uw9y88hR4boAXnpHlgcVnSrB8yv6Aww7IOECJPVnrgAV8CDW/Q5gPjnVIHfvDrn/id2oD3VFk+yST/n668ze8NXodNmw/+vczed8B0vWTf8FqsTHxs8W5uSHbZPpn6N2a557UaQYU3zA50B5ymaP6BGH4lwBKRQd31j5SdKK32EFH3YrRJgTxRVn8hb7edkhRivRABsx+hdotPf4eGV6DVA4DZiYiOGuKzP17Mrzr7MmMq79umDyjEna64cquA5PhNxPHBiBdxE+Iby61F9mjAg84OLXZ/43h7YMA1PObGCpngAQfgRuDXvv/dYighFS/KBA+jqDZYVyHYqtj//Aq9PYRRfSXgVyKXCNY/2BOI+Sx6H/3HNp8vShz/8orlcyGDcgVLxPn/ykqgHRcARuXZbCEL0O0IvKEpPuAuQpzgFWv5yQLD7yXrpAkGI/oyVAOCo3OK8TT3+Vw/RaCtNk8GogSTaa1c2EziUhMOOpGePRKhj5/qg27bdf7avCqzM7g0JYyTBe4k/WYdADesY70h0IKkMFAFdWsPYVeiFO8LCqY7zYgSjMvw1b1q+fA1RDuSIw+x4NL2GRqNwFi0Brwhq1XgW4p3ne+pv//BXk54FkqTXcE8yXcuWuBv/YWtgErYtgzz/VidpqMHWfz2VXAA0iS3W41b3CLv/tiltZI0mFNgCT0MNtVtHK0EwDQWfqYgl3ckbse9AWkAAAAA=',
  engrenagem:'UklGRi4FAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSCECAAABkGzb2to2V2/iJyjDe6FWpxxmVGnmpYzKHaGSMs5qh0Eusylay+r/FaTv+/4/2FlETAD+G07WiMh8ubXmPlDuhzU2RcxwbaWc6poKiN22liLeDdeCAZ9R4b3ijDgQpkQUt+XUeLUcf8YQ1QJLLyi77GcYlZKhzMjKS8pvjfxDwn/aEsqPLITENRFQlJwGioa4gV7KIlopG0nzcpn4VbWAnG/TmnBvUAvu+WoV12Kot7kW6mHarRgW/VWXWr4NjBiHRmD3hjsRbMey6nxP++tY9h3WX0pmPGR6VyTT1kZ+CQ6AWVjlmaJe27XpakpC44G/yiKipDp9rU02mZDmQQgLksxkUvCdVF9AfEWD6APrNel6Mk+HXnMSnToU53USDumWNe7rEGNM6ZLGIVtQurBuvNG4by3RqWvM6yScaR3yZJ7Rec1BQ+eJ7AKp/gB/KtWg3ZKC0UinIA6iSs1IjGSVhKZWiQKoFw2LzA5OYZXYpgjb0zyiyMvyzqfEfwnr3yVE356cOXF7xZA0thaRszcsjZC7JrDitxyixEpMTpcsBOR4m17sWkXNJ+fVBt2b0Bpwb0ALTcH0/ZbETMeCFOohyxSB05IiEBlWqIeIkbQBgAQARlqMl7AZ5ZSQWeOZf+DHOSXYDWpEptIGlVoGEH4hojSE9eMdYM7wKjmAPxjA8Ru8iLEG23j9awlNTgtr+jLnztrCx7yPWOt3f/xTe4D/hgBWUDgg5gIAAJAPAJ0BKkgASAA+PRiKQyIhoRhZ3lQgA8SztrHUBzABA9cVvl7c7n4dMd3nciRfQA/hv8U6s3oAFiIyi5mr9fWQr+Ar9GQjpHMI8oPBVjtJjVlNBji+MHArbwDj40BHd+rlQQIQk7s6rFhvoSSbahzlV5ZkYMw5eUy4b0+zkcmZY2wkq3AA/vv1///jd//+Nif//jEDe9i4Kqir+0ETB88JjesK5DuGAcgnPNWWZZ3F7ZYTXH9f+7yxYQjA23k8rBJWr1TkvFLXFA3uI5aNvf9C6dXfQ5rleXeAqsdiE+WTg//81snt7oFYVorhzfR/Q0Hs61JNU2+7aWAQuBvfpVb71I65iHqkv/x+ROMcZo4M6KHgwXubnivKRS2iNiqSdVsf33kCK5jhuW/Q3REV2Dfi/KWvBgt/qBwW15XnEoQdIxfaQVXEioIiho7WuIuC0btXPnGLqgH7G86k5hW7knNj92Xe489vv2IXOXGg4QLK5ZkAE2gEW1eF2reVb6KtSMN+HGg7lGBmiE80veoSg2AqWWf//5UNLsDaf1ojl5rmX/3CODZx+R7Y0zwPxDhutMMqC7Kg7hirDZPdPsNeFGW0X8GlTEr/wi8h+KOck3tbRDTvv47mkRrwV6NEkBXekeqb24FuksdfW15QaVAe//fbW/2W+WHOXUn7XKnPNe6skXjBvtxGymGgeovO+apPNX3ShxFpX6HdHbTfuzuPjzhphuVZAW9TioEBZbDFRiWj0SpwRlUsGzFgD5gJ14xzW0Eo2XNjawqXv/5x/y6NhL52vbRGm/V9vd5DA9mQ8PdR/8embLLy9fcPzze1nQMeImEGvyfUC57X6laa0i5d4xDLDAHRU4uCPxHxKLULFXLBZAGHdb/x4MC8n+fa72r8/JZ9+phuyDt5uYMmyO4VaT/iXimBxhOXlrBTKdBkf/89v6nY3x9wS/9//+/Q8Ctsw4JpX5vY+w9Z5JPyrkup7//y46AAAAA=',
  estudante:'UklGRhIIAABXRUJQVlA4WAoAAAAQAAAAXwAAXwAAQUxQSHICAAABkHPbtrE99ye846vipPzKsLJt20mbL11K2zY6285n27aVFx9ePrt4nid5z91xUkTEBKg/9Y7x3zpx0uSp91/NmDFr9uy58+5/XLBw4aLFi5csWbJk6dKlS5eYJ+oVUQPCo1rdAqNPq7cU0Gqk73unInedOnni+NEjhw5WC/We2mV9S7ev3ADpz8p6AovDJ4YosibIG3epYqGjl8qrBfKIUqGnh6jUIiQGok6LMBqBwPei2hQMg33IH2KrMsmGQmQxhhiCANqIVC1gCAEIpDE9B0JSBioVk+pFUC6Nq1kuCMVVLwcyRwCG3Aaqz0BIDhOINgDo0eAz0S4AAaEQABCdAhAUCpBFaVJNFOEEAhqcIVLrXfAKdQHRyryjyjOEQRU4fUKeNpcyrwLwxcEQDWkvYJECABMYnoh127wxDWXYJeax6VMO3FKMGwCfzBdEW4zNaGqLoVDV8MsAGyyeAMA1igXoFcpWll9M5RRqQ0ikO9thMRTmHg41NCBRoaw3WGAwh2oR8CrbW1YHSVRv+N7bVVllsRR6w5WobB2w7mEZ0hkm3wW72TbgGJUVRNi9jwdYqJTG1va21s6PDKPSIRt8MMBE/ADywZ1M85zQsmIgzbEQNPUsJtkLfQ2O7R6NUBNJsA16ByK12wjdA5GaDYH+Tr0G9xKgUqsyUF7R6CBIR2sz2GBxa1MI2puajAFvSJNyItzWYgyYg1oUUuGqDgZXqwbXQD5UrpbtnpzBVi+2HOyG2GM6rJAq5Dsk5eSLljL4aqXA7/zfidO+O1gRbR2fnR1tH5+dHW0fn50eE5+Ump6ZndPs7fJ43G6X0+nMkvr7ElZQOCB6BQAA8BsAnQEqYABgAD49HIpEIiGhFAx2ECADxLIAZ+oMKEip3O3hvlIDB9kv3L7ju1x5gHPZ8w/6+fsl7wHo69AD9lesI9Bryy/2q+DT9rP2b+Af9nP//1gFn2pXk2y8ov1B7BP6zb5yd91Wfg7rdI0OUmXb1cPNLwxotuzp4ewx5LPEeMhsuEQQyt+wsdt6EZvyH+Ish1KXmRGtDtiyeagKUM4TZRAuWWjIaL/xfB1Pzgo4xp/3541iCRSah0+2fe4m27IHXrNxOuF3OZEVTzSqQ85/yytAE9SXGx7LPj/HeqxCb0jBGX8cAAD+/tAqO2tVS2sO1W/2O5XT3yIw2xhNgmsb8YvA6jZiZXGCeYohozeZqQfovUgJbnkCgBmGdTvn7txgiAq0c//fvaZcRBxNrK6RiUAe7qmG8o+tNWDYWA2nkoBONOuNXvCjCvhf6lDeQ71WUFnmK0NHax827vnD2QIqZO9n37KuKqQz5QrIrG1cf4l/z92KE4JBwtwQia5F8fzJLDry1Iz5keqXhr0ZrF13N3264/rWmyj5RGDLfE/Qx1xdpWYzPL/5inrA9Vr25f//2Mnff//oVOBC1A5fLewngZ5mfvzMD0nJxuyM3ZLW/4Ktp7rLOD9NjLR6qtJVccdaF5W2xxW8gG/6YGP1uLHhaKxkT6umjvyBqt/VsKHHIvfzttIMX2TKR12Ha2/XUuCDbPRUeB3n9KpnUv7/jshf/Mo/yYuP31/QX/UzroC4IKYlZVw4Q+77E+Z3pMWcEq466MllzTIexx8PKJbcrs2tF0diYWbJQ+Ey6LqNno28lPuvClkqOlMXnDO2ul4w1HBv9raV5FzQOy9zIXHKzfvM11GVlXYcNNXh3/7fv3/xR5/aIxy9Hi7DJvXr/xtYqf7bOvlgTomBxttj5h6LGe1m8RzGa6P2C7qNU/1/sY7MWn8hVV4pFS5Diel/mkxxHrjbX0bkxkDqnVfkYFulthwU0mcNYCI87prLla/wuAXt2jxOK/IhlTP1RcIvBXdc8MbzJbPSY4nhxv+JmxxQ8Fie3ZrtPVb+vnaUc4LEEoDrSVA767OeCQzj7M7EufYVN9pRujb7A8oTb/suLVyVK+Gl3p4mrz7unMiXKSd43qfahQpNrx/oi6XhWJXgBQVe1uyJTtGEiKxSol5RREmRgcI0QXUrJh6d42pkhvKUYC3WiUZF0MFKKjqRk+C2TFWa2/BTle78wK/f85hcJJetmvkT+Qi5PQw2nP6txFpQw0zTujzTMsy707Gibpr6k4/uL/msZJ+kCMXh6gh6bgxSsZO5QWO5pGXKJ6GotL2N/GKl3eHx52d3Me/2L1PeszWutU39Lm4Ij67d24v6z0yq62X6ot7Hnl6iW+okAP/+wk8/3/9hVi1TjXJL/1LWJVI11YF84DgdB9fb0Axmfq0Ymm0/2uVl1gLfxEKwXoGlqD7/Kx3xHdtUbHKcrYRAoAZ393GQDuQufe/ht6c8+B1nFX7NyogfR7HQ4BOeACK164zTIPzI9b8R2FzeXZK2uCWGk2XNnmoWrzO+6YXLrcLZqQwnJ5PnLm2hespez5gbV8g8C/eVPB8cjsp9d2o8PdFkGV8GkOkHgRAjq38mUDMcivzKHEJWpHcGvZFqDwWy3G4C7R36EBGFqHOF3lZAArRcOHDnMAr75sGBE5oVGlFoMLPaDlUd36vceoaqE07eRoAxY2o8GDrLt9qfymXCz//kQZ0cWinsgvcfoS8z7UMFwGHQ/JROSdm1O/LnNZzYtED8mH5qYS9bDbqjxUWiBVQE4Qtma0Del/IpVkKvnG9T16VdUMMx603Q7oLk0uaNiuqeiwI+nu3BtAUgQrif3zRPHrWEVPtSAAAAAA==',
  grafico:'UklGRvYEAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSBIBAAABgCPZtmrlDuGPAnfJmAcZMaFbJqE7RETu7mQwBHd3efrdbnTul33q1g8jYgJEJnXiyFX0hkJuUgMhv+vYlvn/9/f7v3qUlNLbuES0qxKqi0vUuQRqYxJ3RikrJpErVY4ltK0SxpIeqlqCb1B1aE9seLXjnw2HjVs2ztk4Y+NcOy6oAbRPahHNpSbR/qk6tGvtuGHjVjvu2LjXjgc2HjMeD2zca8cdG7facUMtorn8dKA9UXVol9pxwcY5GydsLFGjaHPULNostYY2Q+2iTVEbaJ1UP1oNJWJYIaF4inWqkh9HimapiOY4UJdQb4eJd4tEy5/iEO/FIplj64Zh+G3TMAzDDoeNZP5Yvp97xZFRkUkFVlA4IL4DAACQFACdASpIAEgAPj0cjESiIaETPMzMIAPEsgBdlIbdC47az/iAdKvzAef/0gH8r/4nWAegB5a3siftx+wHsVlNL8lr2lN+Q67iL1kGT9mFXpUpLZdpwIlCggEenQGktytmwC7v17b8S13K/ylxIjhTA/1Aiya6OLRTBy6NmNjKS5x3+Y06KiN+W6UQApU9fXgJDQ6HEoGRJwk6EslTpO6hC7q7mC0+PQ5Gvf92UAD+/tgLwe/NQYyD9g0fgscvLAs+FbY7lXygofz0jbW5vfXK8XA0lqYNTW6CFjw0sJ0AB/tX8MA7gANu2U+M7cPXfaZR4GRfg7U1MiW1SXGD1/twh4b4Jmd8NGQNdR+P91TcB3eyw/itTknv5zeT6jw6+bUPT7w42k9RTk/H38tLPmzzNUVcWhz/XvvxJrrU2L5238UJbBRGKlKKVHDrjHXXoyLgEYdrgK0dSRH8rofgfRPqV0qfN3Ri9A/R0lZFUpkTX7wGvognvpOGta1sZUFLriPGvOO7Cj39Xa56u18Kvl2Kh+CiKSw2Zq2SKPlyB4IZjD2/KFGQ9C+mwGjbNOrs3Kt6J+6RiXOkb+11iY44DFIeK8wfHvtOyDecfmzr0ppVsczxuado+RKFH2HNM4Dgwwnf7pPRU5eW/KleYZs+Bij8c0mx7uPfs1pWYc9TCl3n4U4H5TN0PXGY30B/vs2Z0NfjppIVi0Po0iMqWhARYll/xUkVCnfnSMBku3DoX7oO+abJ87WvSoHlKGy48lx5f52/M2bFsht2aYvHKlwNHpEJ+yp/jiAHRYSZp/mTbGVfvNXMRneOWITrAzY32u52uBuJJKQn6iJb4uufKSBcGeJ+RIvmdgWmk0oQcBawpe+77yMAONSHYG54mcriKaIGAyk97rfh4QBH7Q9C+iKCJ+Q623rvjpG7TdgQPpmw33I+vUreT/hekzGGg2mlwZNcDo47xIPLHDBV1GEKniW3VUxMsgkC8mYP75eJGydbeoq2TJI1ysWep+UFR11koWnSbmft7P4kTvUYIZqa6MEFkmslhzWp4/Nf1Qdf4Prcwa8Uk8nuysEGXA0Y7LGmWbgs+UEdXJ+gIk3VkZ6nw4Vj9YcDLnVMGm/fyMpCxzUjxstUKJtG+8ye0+qIQeXKMcoAREGfaRfbbX1oG2s22EwFgbL17SHQRltKWp8IcCMwuh5L7+HN4eBmdh6ZFV4R27yYSUbYjV2Ety2NViWvAj764OY1ftmcBg22MUdnRAd+Oyfee0q31LtLweJftMcz0AAA',
  lapis:'UklGRoAEAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSDcBAAABgJtt27HnGSFzaIQfsW0PwC9VKnW2q3S2k/I/UmcB27aTO/j4vs+PMiIIJmnafIZ80/X3pbOo4RvAHAdQbYILYJgLYEA23XMBjHABjEmqBiY2KiXl20yY4gKY5wJY5gLf6UIrtwAY5wJdXHwHiSvpDZaqECfZO0l598IquWjx1FK9sC+B0j4s+czkIsPtpFvzkc5FGhcpTLwLlGFRMhdJTLwlCvRpTYJn8RrPRaw4mda8xIiTY1E0ievokgkCTsz3HCVSDIBD0yJJZIX425FJESS0AvzvzExP4SS2Qah2KR0NQL1bQ2EkuhVodq3fYwgJbx3anesKJvGtQWcnUtEL9Hag7sFJMoL+dlQcUvjDYBt/7CSlOhht7d5Gcqo17DyUJDWnbtflaqtRnE4/krai1RZFIR93BABWUDggIgMAALAVAJ0BKkgASAA+PRqKQ6IhoRcKNbQgA8S0AGhk7T8A/FXsB7j8++7HJ9y75uPIX+I+6T2APY75gH6Vf3bqNeYD9mfWx9KXoAf4D/R9YB6AHlL/t78EP7d+jX//+sA4UD+q/gB+gFMy8J+i4HzGckArxhOQWmB7Q0ADbCcgeTijX89Iy2vqGYRJU71fWMG9txk890KXIhuY76Rc4V1AKbRKnANBCWlKefv2BBCs3j3PM8i5BogAAP7+0Bwuem/Ertq0h5h4yJ0ikZ3urMiO6pwMPWfOcIKaCuFoM/77FG4UAmMNY5N/dr87A4lkx6mW+GwjzfpwoGi5eq0QCrDKaj2Y7B7i40/uiZfH25HD0wlO/Qp/4qAHfsrv///Aj1on6hG2j8vrd3JBmEk7/AZfRvpMN6t5QdOE5GDLjTsbkMgonp+AjIlre33GhLddY7JonDpVJgayT04yYC0UnxnBChwfbxuONF3SxdvVs47cQMiNSYREWCNmAO4GtHPlRhdDp3RIuEgiafxbLE1ZSU+Wi13gf8gwvm3c1ONXrvKkvZLZ8SW7/PO94XfU4zS6Ta1u61nDDYytG+iXGxpZwlhv/hLT//98z4tReDVJbpY1XIPFhajI/nOFBY/+JtjsLi/1N9Kt7KnMs1TuTznHwXMHhyYrf8O4lNjFyJ3DPhLViH36+gUlDmJVAXaF27YoxY9gDEuqdEyOxIcAj/lXMi3SNs9KkL3ow5u1YrZvKGgW29O4nTxz/+IxNqr89RxF3lYLmk+3BrP+bLwcVblfkWc0wKx1IaGVCMzhTfbkR8da+QzYMh846yqR2r5Y1XppkZwCzTk01NxqMdRfm/VGunr0GFjX770wG4MVWqZVR4exYNA/+V4i2iMlYvHluFpsUR3bnJZ4XGXMUelB3/Atp/8HrU+4rzztZ6T/8P///5tf//Nf3//moTizM4GJnD9STdG7/4yzoAjMSXCL08YAOCRW2h/V+TD45PiCmgfYohqbfLeYX+klXnippySyv9/Ovn+1T/HUlr7P2E/J3/wK1eswD1niOd+Dsovr5DpVpm9W6oAAAAA=',
  livros:'UklGRjoEAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSKwAAAABcFpt27J8ozACCaJ7dZp2d8j/nxiFQWAAd3e3+OPyfi9OiIgJIN/F/Cp336oezJS79xIMd//3h+hSHl2XV0VYcH00OCcajpfFjoYNDSsa19Z1WHAjNLg/Na30+aMtRVS/QEk0iI1h2AuPtrRcebQslYqFQj6Xy2ZqdAF/uRJoELn28jhF1yrQkKMhRUMMwAXEB8ACxABACkQAQAyEpO62JGB1DMPeMyyE89oDVlA4IGgDAADQFQCdASpIAEgAPjkWiUMiISEa2W58IAOEtABldEeEk9I/I78gOtd5t7zc++aTrO/XedX/Aey/xQPOA9XvmA/Tv9wPeg/xHUAf3b+3esB6lfoIfsR6Vn7b/C9+0/7M+zR/7br0bN35pJuAT+l+oVLaHazu67DExQ+hfjfkSPFTn9jkJvDfO4vzKKO+a7eht2K4mf9MtgbwYPYlUTELB+zgC+UT+p3dcC+hCBq+s8LfHQN9qQZGiBAA/v/w/4/N0eg3EBDU5NHBiUjP/w03Dvc3ogn1xHV/4pGmTRj6C3N///GOIMyXQ7vRSYIdJ4ATxcB7zdljG37fkZ7xDTlLWvsKN6JTv4PdDv6yzaE7QV2V0NrLRt4zRS+MqIDkmSot80EkcUry1EM7yjzgZoWBHHLsdP7a35n4aBnG7OEAm1sYgk8trhbFt1zkySLBd9gtm92QOHxHSQ1/9BS1jIIA48wnBtTCZT73+L+rWyzE4hP/8kk33+36MPidKg2BIWELnbMtCcg8WvhGR2A0DqgN3HPG82rInodesnwnZiZMCKlz6/32LFH4bxmwobgAzm/MSeOZwtd6AvIDuGMCzYtBp69Wvq+KAvckEV/fMSjv01rVi87Wef9+WndoZj63urIFDEGu+mELQQnC99tItXm5piJiAAPye0/saOALoghbpWjihfyiZMD9KG1Qv1iEbK5f/8N3VLycv6U+xc+vg54N/7HxeBRY8pK6+gY86e/sP7/eU1k14eInJWlM+rsllsY/XoSHV0JKnDfqdFcD0LW+nfn1jzi4IrU4EYIZL9CUO0O6iy1t822RCTaT8V3XX72sfsxfz83BVrfM5i3qsTwFC0rMfMirGS8G22ShtD5OwU51yMWSON+vOkeEV9izq3qJObKu/rps4t/I6+fgokepr40ilaz9EXUWF7/ezHArUoQrs47U/JuoqM0T/r6kxLguAZhFmWDhqULbzpF8typc5K6tPhqtq02Yj/zV79LX9IWq8FZYyFi3m4DtOtRT7hHAlnp2CxHbraQa0SQwaHhQ0KUXC+Gzxvo9//4NbC/2BgtYNv5RCDEtC+c+oyUG2rDEkHHNCbfWhbWkNtyf9x8F/HWAwjfAVG6xKbIZ7ze0vOefxZ616LewIPxqMyKBc0TpbR/P70z4OnwAAA==',
  luaAuto:'UklGRnYFAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSJgBAAABkKttk2FbNXtfga1sp/sCbBvxyve+AR+fE9n2Ce0T2bZtW7NQFU1Pd/1HYURMAP3vLa2MTJ7y9MH5reuBUrrnXhRj/+GBEYSB3WL17R5l6YNPxXr8wlRFk7+IUz6jpeKuOP+1XsUsUXndXfYJUfpplqPsx6LWn+6k/r0ojm92kPNBVMdnW8t9Icr9pbYui/rPllYI4B0rbQK5w8ZbjF8W1gro1VAFMRReFWaewF4N8wMnEWKyAJ8ye4T0yahQoLeYTMO6aHIG663JF6yYiYAbDKAVBw2hVQUtRosE7UebHLTvt7H3t7Hvt7EYLRI0iFYV1IdWHERoZPgeK2ZyBOu9ySSsmybFWIdM6DzSNzKehHTbjL7isBdiPs47Clnko/DBMLQe5R2Ff4zBZLEb45oNOo3whawmxfTFyHIFa+PjtqiMdfEhsj/MmvgiuSxjPXyY3FbEtfw4Sa6TX+t4SQq9lewudoV0Jj9nN/yc1Holr3/Z41cHSbPnzb1jx39CgCULrnw14x9PjxNu49jm48d+fHt3/yL97wVWUDgguAMAAJAVAJ0BKkgASAA+PRiKQyIhoReqBdggA8S1BuEVAA/QA9E4DvEen5D/liUO9Y8U4233R76DzE+b36I/8R6gH+k/s3rKepN6Fflvext5SmOABUT+A8nwFaK2rVrS99Dy70A1fm5XoAU8m6pG4CMmqAvoFWcxStRBLpecS+cPBrXwsw4JllIRhVm0vs9+4JV4bRfbzWbdHa+nLN8J1Eiy5KL7Y2//x1BRqw88TkfwmHGxEpe7MsAA/v/hhYv/9NR0iuGvDa9805MNYC+YEU0J2U/CEPZV+lQqt1vY2bwIh3L+Twh8h2en/Y9wuCqptdvkctRVlZ3RGe0wMdUerZcR8DvaFuCZdtaJ8fmT+TKi5h17VBrLu2ty0earNKoJfxON4/5XL+jtoty9+U+iBAsLQ3/x9H/hE3zmjTgJSXNxOEn17p8mrbNN/haInBIop5MmNdk/5lMMxmaPdKpucX/yX9PgOe7HXTDiED7Bk9XHh05BIOalAZybqFXEYM5lWDf+WkFSwCc7kA8MSWqGphQn+f1vDDcsniKrWZ1PesWOCRxqop3bpNLKZZVMH84PGFpmbDOlyWYc2EineL9LC+v7nDDn+78PbkZQ7euIZc4gToMRBrmo3mJK/NbQGHjlAhHmPLbPj3HA9rp0yRZfiKI0SX37OvhKU1pyFNK6dzLXC48mkTZIqP4XyTUITrvLsfddiyeEezNCS/dcW3oxqI/PZpRXEWKG1MehCbH1dUU6aqxjbVbplt7PM0clPqww+rGO0Xss8ACChtgSS4Ww4O5mF5mVn6x1x1T6UbHr5SEZDgbt2/j/sdD6LWN4whIkgr7mQ0PBi+wB/72R//isB//4XV7+6AqmPWyZJXa4sBVnAy+Kh89brpiyLIrG6o5NYn2wZz/mx5r7Qa5h8HZYK4j0h9iAsEtkf7ECFVQi+2mjnJmnhA4RUEbpY5dOWqKKFqo/hS7qfSP3y6RFG09BCmZGUslSOWKtM2Gfnaga8xKu6MQufH9s/k75xqV7yv48SEHOJflI2hG7HpyuBoMnOf1fBCFgJvnfxys2v2rSYTcXTHmfyWrVmUaosgz/0eM///A4xeDpfs9XS599R717o+XDZwnUjlP8AZSfdi1famHjXn8Wlf/3+/7/9mc/8/97/fKfuv/I4/2j9CgwuKQsoBLgKJD7IT0TKrpPfWTkfP9nqYXElSCLSAE9JNobqMfjLikbDkKojgrrfiK9dxjS7wigy/PxLD13+//6by6p0NxxnVX1bOib4WCK0AA=',
  pagina:'UklGRhYCAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSGkAAAABYGJr24wfi7YKbZY0TaKOmWY9vqN5n2NKTkQQSNr4pXgE9wkWeJgwyqWVVexDepO3NwEiM7tInV2l1agIWAAuHZiMTIUmYtOgO5LQKfAEeP5VWH0Z22Usf/k6Xnv6D+Gl7uxm2uy++BwAVlA4IIYBAABQCgCdASpIAEgAPj0YikMiIaEa2PWAIAPEtIBn4OgQWBdVv1PXcBKg7VcL1nDwYpjogfEPIKZQHSZ0rYsPH1LZcyFqHKzBnNUXAUslkPwL50MSf89G23st0AZgAP7rWf//0u09UICPY114aC+ZmP7NNab86D4KH9NX7mg36ZLamUEmIdG+kRiHq4T+1h7IV5EH096UTkuZAvFsv9//QoyB5BpIaDJPMw4S9RlUKJYWjFOEJrdtRa/+b6ZqddRBc2xefpdJjHthUAxUW/XaHdhFt1CdWOx1giEiv1rf0mJz2Ui4ZCUDK4iU8FJWroLCcQmDG/NaSRZhAB4H1Yn5+Cd3QuPCequAnhvhcfC+rMU1b/TZltTddHBFHS7fPe7tbxgMAqy4Mgu0zmMPuEWjHpQn9gKtiHXqlQU0x/0086URIh8qqQFDeRlaro7mA7N4FBys5O0SBLWn6wjhbCp///oICnpVFT5btGqnWDUDqW8V40GMJ0NDFkwTPJV09FEzzucgRc3AAAA=',
  porta:'UklGRiQCAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSEsAAAABYGLbtpI/fjqJSKTTmIO7W7Lknv9FGxExAeTLF8uDcsuBmAcgi9EgZBgHYnEZwWWYlyH/w1oQVIwGQcBIJ3o+g0EsLU+oOhJPvlgAVlA4ILIBAABwDgCdASpIAEgAPj0cikOiIaEWazVUIAPEoIcAGULgBrr3UN5ih4/tLALP5+gHOAbgDzePwA6nLgAPKN9nL9ZgbZwr2wm61VsJo8WOvGIwT0M2mZ11use4snpof33GxHvQ/41Wzqr1GFMvvue7obFG4nIFAZyAB8rTtsIAAP7ue4vDFUqdS5dH5FAv4u/KA5lbbVAVvsMTxIDr14SPlXEYF8qMrSBTE+Yu7Aewb8xFM/eTfDgN1/KYFA04BjHZSQktWj1ll/9wvQ0Vxn32nTcm3hjVZlChSlKHDKsCxTcYiFFRz7g2hTAP4J0AeN339pvwUQoTGBCV3nbQi5Vb9r2RNROv8fr6LU/iebrrMeyN3GOmNlJfC48ORWdqce0YlS7FPFP8HAIzzJDspvDXtsWLtD7D7KmXdL9QvbQqSCsbl+zzpjriv5VDWoBqn7ftUzXCttzzy0QReYLR6b1nYYXsS1/uIJgkEGIpKNAUY0bD9pwkyC8NnDfibOGS8i9c79/5epsv5euCFrPVINFI9Y+ZAXKetfP//W/PBOwZ+wxa84eUtjlI8x9GdsgIf9udWkAAAA==',
  prancheta:'UklGRkgDAABXRUJQVlA4WAoAAAAQAAAARwAARwAAQUxQSG8AAAABcBvbtqq8Sn4lv6tfgMXu7oZLJ4REWsHrAIfL94yImAA0ApMURbYBsb1er9ctUTeRo7/eX1/u6K858Rf+4Vrrgw/GX641v8hQ8bX2NtS0fnOoyd9T09aY1S+D0nDdsAWF1rheeI3gLWleY8lC4yoAVlA4ILICAACQEQCdASpIAEgAPj0ai0OiIaEXCXVsIAPEoAzunhwH3lkwy61P0Hnw5hPcAfrT+zvvL/1X9K+wA/u3UUegB5Zfsff4D/efsB7SBgKWgxjes6FmlleqQfHqwx7Aa78muUDMTWvRANrMIv1pQKEYsW5pIPVMPcgkmG2ifCzNd/LL22jxb1rCvmpPkeyLlA6vTJqCxrhX4AD+/7m2/6cJqnkRaTyLGhecKc81SdyYZpaPw6rJSxrOFU6E/pj4bk2JQcF+xhiqvO22C8Jp/fhUGyP9spwPzyBJ2vuMCVgLxOHh2gXosrX97QR8WLd1OwqeK3qa/svstSZ/UJn7LWPudQLEgSmQJzSkYzX9Wj9PUPSKD4QUfc6TtD+Ar7P3hbN9LLpV0uyjtj3HhKK/Uz81xUofTU+BTUrQuDEZUzCdLlLq6OgbdsR+hv+CrAv8y6L/NZVR7v1TxeVeW9SYUuYrv7t9Oyew+Nm4Tbf+yOC4wWhskpCk8W6XKq+7qSYGSWqJAcEnNZz+pEtJb0aqa8xCB3gMhbmTixfXGcgtz+c0nxFq1kBNfNbnAHKbeOeecKRt59kyZKKkDhHZQlTT4GXoXcKltD39r+4pcryLswLWkN68Uajp/gfXV5tkfDsCH4YzO2sqHXCKs0yz/M2jFIiuy5Hg/a1RWUFC85Es9NX3gpTMCVdmNmGhKAHU9Ge3sQDqGq47qTRDSN2m03zaE7xB7c+MWjNK12qe/9K7VESqKMWy69eiIqixSIfpGXOVDObKGwBiRNDmQmClTqppM5xGyEfgVfEVHKQLeMkU1f4XeY2Y9awPZDLQl1kPmGesOmed//+RqIXOqpZIUjFqYDFsojYuyK8zNH/YavjtzlaJWDx0alqGiUFCrVi8TsZe0fJIHE4wcx42C8Tcuhu43Abhk2jMAAA='
};
function feIcone(nome) {
  var src = FE_ICONES[nome]; if (!src) return '';
  return '<img class="fe" src="data:image/webp;base64,' + src + '" alt="" draggable="false">';
}

/* ─── Utilidades ─── */
var _tT;
function toast(m, ms) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = m; t.classList.add('show');
  clearTimeout(_tT);
  _tT = setTimeout(function(){ t.classList.remove('show'); }, ms || 1900);
}
function mostrarEmBreve(nome) { toast(nome + ' \u2014 em breve \u2728', 2000); }
function escapeHtmlSimples(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '\u2014';
  return n;
}
window.authLogout = window.authLogout || function() {
  if (confirm('Deseja sair da sua conta?')) {
    localStorage.clear();
    window.location.href = 'login.html';
  }
};

/* ─── Tema claro/escuro/automático ─── */
function temaPreferido(){
  return document.documentElement.getAttribute('data-tema-pref') || 'auto';
}
function sistemaEstaClaro(){
  try { return window.matchMedia('(prefers-color-scheme: light)').matches; } catch(e) { return false; }
}
function aplicarTema(pref){
  var efetivo = (pref === 'auto') ? (sistemaEstaClaro() ? 'claro' : 'escuro') : pref;
  document.documentElement.setAttribute('data-tema', efetivo);
  document.documentElement.setAttribute('data-tema-pref', pref);
  try { localStorage.setItem('redaon-tema', pref); } catch(e) {}
  aplicarIconeTema();
}
function aplicarIconeTema() {
  var pref = temaPreferido();
  var efetivo = document.documentElement.getAttribute('data-tema');
  var icMat = (pref === 'auto') ? 'brightness_medium' : (efetivo === 'claro' ? 'dark_mode' : 'light_mode');
  var emoji = (pref === 'auto') ? '\u{1F317}' : (efetivo === 'claro' ? '\u{1F319}' : '\u2600\uFE0F');
  var nome = (pref === 'auto') ? 'Autom\u00e1tico' : (pref === 'claro' ? 'Claro' : 'Escuro');
  var el;
  el = document.getElementById('iconeTema');      if (el) el.textContent = icMat;
  el = document.getElementById('iconeTemaSide');  if (el) el.textContent = emoji;
  el = document.getElementById('iconeTemaMais');  if (el) el.textContent = emoji;
  el = document.getElementById('txtTemaSide');    if (el) el.textContent = 'Apar\u00eancia \u00b7 ' + nome;
  el = document.getElementById('txtTemaMais');    if (el) el.textContent = 'Apar\u00eancia \u00b7 ' + nome;
}
function alternarTema() {
  /* v6-4: a pílula "Aparência" no menu Mais mostra o estado atual */
  setTimeout(function(){ var p=document.getElementById('pillTema'); if(p){ var a=document.documentElement.getAttribute('data-tema-pref')||'auto'; p.textContent = a==='auto'?'autom\u00e1tico':(a==='claro'?'claro':'escuro'); } }, 0);
  var ordem = ['claro','escuro','auto'];
  var prox = ordem[(ordem.indexOf(temaPreferido()) + 1) % 3];
  aplicarTema(prox);
  toast(prox === 'auto' ? '\u{1F317} Autom\u00e1tico \u2014 segue o aparelho'
      : (prox === 'claro' ? '\u2600\uFE0F Claro' : '\u{1F319} Escuro'), 1800);
}
(function(){
  try {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var reagir = function(){ if (temaPreferido() === 'auto') aplicarTema('auto'); };
    if (mq.addEventListener) mq.addEventListener('change', reagir);
    else if (mq.addListener) mq.addListener(reagir);
  } catch(e) {}
})();

/* ─── Sidebar ─── */
function toggleSidebar() {
  var s = document.getElementById('sidebar');
  var o = document.getElementById('overlay');
  if (s) s.classList.toggle('open');
  if (o) o.classList.toggle('open');
}
function toggleRecolher() {
  var s = document.getElementById('sidebar');
  if (!s) return;
  if (window.innerWidth < 1024) { toggleSidebar(); return; }
  s.classList.toggle('mini');
  var mini = s.classList.contains('mini');
  var b = document.getElementById('btnRecolher');
  if (b) { b.innerHTML = mini ? '&raquo;' : '&laquo;'; b.title = mini ? 'Expandir menu' : 'Recolher menu'; }
  try { localStorage.setItem('redaon-menu', mini ? 'mini' : 'full'); } catch(e) {}
}

/* ─── Foco no resultado (helper compartilhado · v6-4) ───
   Toda escolha feita nos controles leva o resultado para a área nobre da tela,
   logo abaixo do cabeçalho. Só rola quando o resultado ainda não está visível ali
   (evita solavanco). Usado pelo Estúdio; serve Temas/Minhas Redações/Evolução. */
function focarResultados(id, opts) {
  opts = opts || {};
  var el = document.getElementById(id || 'lista');
  if (!el) return;
  var header = document.querySelector('header.hApp');
  var alturaTopo = (header ? header.offsetHeight : 0) + 8;
  var r = el.getBoundingClientRect();
  var jaVisivel = (r.top >= alturaTopo - 2 && r.top < window.innerHeight * 0.5);
  if (typeof opts.travar === 'function') opts.travar(jaVisivel ? 900 : 1400);
  if (jaVisivel) return;
  var destino = window.pageYOffset + r.top - alturaTopo;
  try { window.scrollTo({ top: destino, behavior: 'smooth' }); }
  catch(e) { window.scrollTo(0, destino); }
}

/* ─── Gavetas genéricas ─── */
function abrirGaveta(id) {
  var g = document.getElementById(id), b = document.getElementById(id + 'Bg');
  if (g) g.classList.add('open');
  if (b) b.classList.add('open');
}
function fecharGaveta(id) {
  var g = document.getElementById(id), b = document.getElementById(id + 'Bg');
  if (g) g.classList.remove('open');
  if (b) b.classList.remove('open');
  limparFundosOrfaos();
  acordarDocks();
}
/* Nenhum fundo escuro pode continuar capturando toques com a gaveta fechada */
function limparFundosOrfaos() {
  document.querySelectorAll('.gvBg.open').forEach(function(bg){
    var alvo = document.getElementById(String(bg.id).replace(/Bg$/, ''));
    if (!alvo || !alvo.classList.contains('open')) bg.classList.remove('open');
  });
}
function toggleGaveta(id) {
  var g = document.getElementById(id);
  if (g && g.classList.contains('open')) fecharGaveta(id); else abrirGaveta(id);
}

/* ─── Gaveta "Mais" ─── */
function abrirMais() {
  abrirGaveta('gavetaMais');
  var m = document.getElementById('bMais'); if (m) m.classList.add('on');
}
function fecharMais() {
  fecharGaveta('gavetaMais');
  var m = document.getElementById('bMais'); if (m) m.classList.remove('on');
}
function toggleMais() {
  var g = document.getElementById('gavetaMais');
  if (g && g.classList.contains('open')) fecharMais(); else abrirMais();
}

/* ─── Gaveta de métodos (Escrever) ───
   Contrato de produção: sessionStorage['tema_selecionado'] = JSON do tema.
   definirTemaSelecionado(obj) antes de abrir preenche a legenda e a sessão. */
function definirTemaSelecionado(tema) {
  try {
    if (tema) sessionStorage.setItem('tema_selecionado', JSON.stringify(tema));
    else sessionStorage.removeItem('tema_selecionado');
  } catch(e) {}
  var el = document.getElementById('metodoTema');
  if (el) el.textContent = tema && tema.titulo ? 'Tema: ' + tema.titulo : 'Escolha o tema depois, na folha';
}
/* v6-4-2: Escrever vai DIRETO para a folha e a gaveta de métodos abre lá dentro.
   Motivo: navegador não abre seletor de arquivo sem gesto do usuário — depois de
   navegar, o clique programático no input é ignorado em silêncio (iOS e Chrome).
   Dentro da própria nova-redacao continua abrindo a gaveta, sem recarregar a folha.
   O nome fica: os seis chamadores em quatro telas não mudam, e o
   definirTemaSelecionado(tema) que todos rodam antes sobrevive à navegação. */
function abrirMetodos() {
  fecharMais();
  var naFolha = !!document.getElementById('textoRedacao') ||
                /nova-redacao(-[\w-]+)?\.html$/i.test(location.pathname);
  if (naFolha) { abrirGaveta('gavetaMetodos'); return; }
  location.href = 'nova-redacao.html';
}
function fecharMetodos() { fecharGaveta('gavetaMetodos'); limparFundosOrfaos(); }
function toggleMetodos() {
  var g = document.getElementById('gavetaMetodos');
  if (g && g.classList.contains('open')) fecharMetodos(); else abrirMetodos();
}

/* ─── Montagem do esqueleto ─── */
/* v6-4: "Você ON" com o ON na cor do logotipo (uma variável só: --marcaON) */
function rotuloON(txt){
  return String(txt || '').replace(/\bON\b/g, '<span class="marcaON">ON</span>');
}
function montarEsqueleto(cfg) {
  cfg = cfg || {};
  var ativo = cfg.ativo || '';
  var body = document.body;

  function navClasse(chave){ return 'nav-item' + (ativo === chave ? ' ativo' : ''); }
  function barraClasse(chave){ return ativo === chave ? ' class="on"' : ''; }

  /* Overlay + Sidebar */
  var topo = document.createElement('div');
  topo.innerHTML =
    '<div id="overlay" onclick="toggleSidebar()"></div>' +
    '<aside id="sidebar">' +
      '<div class="sideLogo">' +
        '<span class="lg" onclick="toggleRecolher()">R</span>' +
        '<span class="nm">Reda<i>ON</i></span>' +
        '<button id="btnRecolher" onclick="toggleRecolher()" title="Recolher menu">&laquo;</button>' +
      '</div>' +
      '<nav style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.2rem;">' +
        '<a class="' + navClasse('inicio') + '" href="inicio.html" title="In\u00edcio"><i class="em">' + feIcone('casa') + '</i><span class="tx">In\u00edcio</span></a>' +
        '<a class="' + navClasse('temas') + '" href="temas.html" title="Temas"><i class="em">' + feIcone('prancheta') + '</i><span class="tx">Temas</span></a>' +
        '<a class="' + navClasse('escrever') + '" onclick="abrirMetodos()" style="cursor:pointer;" title="Escrever"><i class="em">' + feIcone('lapis') + '</i><span class="tx">Escrever</span></a>' +
        '<a class="' + navClasse('redacoes') + '" href="minhas-redacoes.html" title="Minhas Reda\u00e7\u00f5es"><i class="em">' + feIcone('livros') + '</i><span class="tx">Minhas Reda\u00e7\u00f5es</span></a>' +
        '<p class="nav-section-label"><span>Mais</span></p>' +
        '<a class="nav-item" href="evolucao.html" title="Evolu\u00e7\u00e3o"><i class="em">' + feIcone('grafico') + '</i><span class="tx">Evolu\u00e7\u00e3o</span></a>' +
        '<a class="nav-item" href="plano.html" title="Plano de estudos"><i class="em">' + feIcone('calendario') + '</i><span class="tx">Plano de estudos</span></a>' +
        '<a class="' + navClasse('voce-on') + '" href="voce-on.html" title="Voc\u00ea ON"><i class="em">' + feIcone('claquete') + '</i><span class="tx">Voc\u00ea <span class="marcaON">ON</span></span></a>' +
        '<p class="nav-section-label"><span>Conta</span></p>' +
        '<a class="nav-item" href="configuracoes.html" title="Configura\u00e7\u00f5es"><i class="em">' + feIcone('engrenagem') + '</i><span class="tx">Configura\u00e7\u00f5es</span></a>' +
        '<a class="nav-item" onclick="authLogout()" style="cursor:pointer;color:var(--red);margin-top:.3rem;" title="Sair"><i class="em">' + feIcone('porta') + '</i><span class="tx">Sair</span></a>' +
      '</nav>' +
      '<div class="perfilAluno" id="perfilAluno" title="Perfil">' +
        '<div class="avt" id="avatarSidebar">' + feIcone('estudante') + '</div>' +
        '<div class="tx" style="min-width:0;">' +
          '<span id="nomeUsuarioSidebar" style="display:block;font-size:.8rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Estudante</span>' +
          '<span style="display:block;font-size:.65rem;color:var(--muted);">Portal do Aluno</span>' +
        '</div>' +
      '</div>' +
      '<p class="sideVersao">' + (cfg.versao || 'aluno') + '</p>' +
    '</aside>';
  while (topo.firstChild) body.insertBefore(topo.firstChild, body.firstChild);

  /* Header dentro do main-content */
  var main = document.getElementById('main-content');
  if (main) {
    /* v6-4 (14/09/2026 · decisão de Alan): ganhar espaço vertical.
       Abaixo de 1024px o cabeçalho do app sai — o dock já diz onde o aluno está.
       Telas que vêm do menu "Mais" (não têm aba no dock) ganham uma linha fina com
       seta de voltar (o Safari do iPhone não tem botão do sistema), o MESMO ícone do
       dock/menu e o título. Tema volta para o "Mais"; o sino sai até existir notificação. */
    var ABAS_DOCK = ['inicio','temas','escrever','redacoes'];
    var noDock = ABAS_DOCK.indexOf(cfg.ativo || '') >= 0;
    var ICONE_TELA = { 'evolucao':'grafico', 'plano':'calendario', 'voce-on':'claquete',
                       'configuracoes':'engrenagem', 'preparacao':'livros' };
    function chaveTela(){
      var t = (cfg.titulo || '').toLowerCase();
      if (t.indexOf('evolu') === 0) return 'evolucao';
      if (t.indexOf('plano') === 0) return 'plano';
      if (t.indexOf('voc') === 0) return 'voce-on';
      if (t.indexOf('config') === 0) return 'configuracoes';
      if (t.indexOf('prepara') === 0) return 'preparacao';
      return '';
    }
    var hd = document.createElement('header');
    hd.className = 'hApp';
    hd.innerHTML =
      '<div style="display:flex;align-items:center;gap:.5rem;">' +
        '<button id="btnHamburger" onclick="toggleSidebar()" aria-label="Abrir menu"><span class="material-symbols-outlined">menu</span></button>' +
        '<div style="display:flex;align-items:center;gap:.5rem;">' +
          '<span class="material-symbols-outlined" style="color:var(--cyan);font-variation-settings:\'FILL\' 1;">' + (cfg.icone || 'edit_note') + '</span>' +
          '<h2 style="font-size:1.1rem;font-weight:800;color:var(--text);">' + rotuloON(cfg.titulo || 'RedaON') + '</h2>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:.25rem;">' +
        '<button id="btnTema" onclick="alternarTema()" title="Alternar tema" aria-label="Alternar tema"><span class="material-symbols-outlined" id="iconeTema">light_mode</span></button>' +
      '</div>';
    main.insertBefore(hd, main.firstChild);

    /* linha fina das telas de dentro do "Mais" (só no celular e no tablet vertical) */
    if (!noDock) {
      var ch = chaveTela();
      var ph = document.createElement('div');
      ph.className = 'pgHead';
      ph.innerHTML =
        '<button class="pgVoltar" onclick="history.length>1?history.back():(window.location.href=\'inicio.html\')" aria-label="Voltar">\u2039</button>' +
        '<span class="pgIco">' + feIcone(ICONE_TELA[ch] || 'pagina') + '</span>' +
        '<span class="pgTit">' + rotuloON(cfg.titulo || '') + '</span>';
      var cont = document.getElementById('conteudo');
      if (cont) cont.insertBefore(ph, cont.firstChild);
      else main.insertBefore(ph, hd.nextSibling);
      /* a tela já tinha o próprio título repetido logo abaixo — esconde no celular */
      document.documentElement.classList.add('temPgHead');
    }
  }

  /* Barra inferior + gavetas Mais/Métodos + toast */
  var fim = document.createElement('div');
  fim.innerHTML =
    '<div class="gvBg atrasBarra" id="gavetaMaisBg" onclick="fecharMais()"></div>' +
    '<div class="gv atrasBarra" id="gavetaMais">' +
      '<div class="grip"></div>' +
      '<p class="tit">Mais</p>' +
      '<a class="pill" href="evolucao.html"><i class="pemoji">' + feIcone('grafico') + '</i>Evolu\u00e7\u00e3o<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="plano.html"><i class="pemoji">' + feIcone('calendario') + '</i>Plano de estudos<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="voce-on.html"><i class="pemoji">' + feIcone('claquete') + '</i>Voc\u00ea <span class="marcaON">ON</span><i class="fim">\u203A</i></a>' +
      '<a class="pill" href="configuracoes.html"><i class="pemoji">' + feIcone('engrenagem') + '</i>Configura\u00e7\u00f5es<i class="fim">\u203A</i></a>' +
      '<a class="pill" onclick="alternarTema()"><i class="pemoji">' + feIcone('luaAuto') + '</i>Apar\u00eancia<span class="fim" id="pillTema" style="font-size:.72rem;color:var(--muted);"></span></a>' +
      '<a class="pill" style="color:var(--red);" onclick="authLogout()"><i class="pemoji">' + feIcone('porta') + '</i>Sair</a>' +
    '</div>' +
    '<div class="gvBg atrasTudo" id="gavetaMetodosBg" onclick="fecharMetodos()"></div>' +
    '<div class="gv atrasTudo" id="gavetaMetodos">' +
      '<div class="grip"></div>' +
      '<p class="tit">Como voc\u00ea quer fazer sua reda\u00e7\u00e3o?</p>' +
      '<p class="sub" id="metodoTema">Escolha o tema depois, na folha</p>' +
      '<a class="pill" style="background:rgba(var(--cyanRGB),.12);color:var(--cyan);border-color:rgba(var(--cyanRGB),.35);" href="nova-redacao.html?metodo=digitar"><i class="pemoji">' + feIcone('lapis') + '</i>Digitar na folha <span style="font-size:.7rem;color:var(--muted);font-weight:400;">recomendado</span><i class="fim">\u203A</i></a>' +
      '<a class="pill" href="nova-redacao.html?metodo=imagem"><i class="pemoji" style="color:var(--purpleSoft);">' + feIcone('camera') + '</i>Enviar imagem<i class="fim">\u203A</i></a>' +
      '<a class="pill" href="nova-redacao.html?metodo=pdf"><i class="pemoji" style="color:var(--gold);">' + feIcone('pagina') + '</i>Enviar documento<i class="fim">\u203A</i></a>' +
    '</div>' +
    '<nav id="barraInferior">' +
      '<a' + barraClasse('inicio') + ' href="inicio.html"><i class="bEmoji">' + feIcone('casa') + '</i>In\u00edcio</a>' +
      '<a' + barraClasse('temas') + ' href="temas.html"><i class="bEmoji">' + feIcone('prancheta') + '</i>Temas</a>' +
      '<a class="fabWrap" onclick="toggleMetodos()"><span class="fab"><i class="bEmoji" style="font-size:20px;">' + feIcone('lapis') + '</i></span><span class="fabCap">Escrever</span></a>' +
      '<a' + barraClasse('redacoes') + ' href="minhas-redacoes.html"><i class="bEmoji">' + feIcone('livros') + '</i>Reda\u00e7\u00f5es</a>' +
      '<a id="bMais" onclick="toggleMais()"><i class="bEmoji">\u2630</i>Mais</a>' +
    '</nav>' +
    '<div id="toast"></div>';
  while (fim.firstChild) body.appendChild(fim.firstChild);

  /* Estado inicial */
  try {
    if (localStorage.getItem('redaon-menu') === 'mini' && window.innerWidth >= 1024) {
      var s = document.getElementById('sidebar');
      if (s) s.classList.add('mini');
      var b = document.getElementById('btnRecolher');
      if (b) { b.innerHTML = '&raquo;'; b.title = 'Expandir menu'; }
    }
  } catch(e) {}
  aplicarIconeTema();

  /* Nome do aluno */
  var nome = (typeof authGetNome === 'function') ? authGetNome() : 'Estudante';
  var el = document.getElementById('nomeUsuarioSidebar');
  if (el) el.textContent = nome;
  window.NOME_ALUNO = nome;
  window.PRIMEIRO_NOME = String(nome).split(' ')[0];
}

var _docksVivas = [];
/* Fechou gaveta? A dock volta na hora, sem depender de rolagem. */
function acordarDocks(){ _docksVivas.forEach(function(f){ try { f(); } catch(e) {} }); }
/* ─── Dock da zona do polegar (comportamento padrão) ───
   iniciarDock('idDaDock', { protegidaPor: 'idDeGavetaQueImpedeRecolher' }) */
function iniciarDock(dockId, opts) {
  opts = opts || {};
  var dock = document.getElementById(dockId);
  if (!dock) return;
  document.body.classList.add('temDock');
  var timer = null, lastY = 0;
  // Informa a altura real da dock ao CSS, para as gavetas reservarem a folga certa
  function medirDock(){
    var h = dock.offsetHeight || 160;
    document.documentElement.style.setProperty('--alturaDock', h + 'px');
  }
  medirDock();
  window.addEventListener('resize', medirDock);
  if (window.ResizeObserver) { try { new ResizeObserver(medirDock).observe(dock); } catch(e) {} }
  function protegida() {
    // Nunca recolher com gaveta aberta, com o dedo na dock ou com campo em foco
    if (dock.dataset.segurando === '1') return true;
    if (dock.contains(document.activeElement)) return true;
    var alvos = [].concat(opts.protegidaPor || []);
    for (var i = 0; i < alvos.length; i++) {
      var g = document.getElementById(alvos[i]);
      if (g && g.classList.contains('open')) return true;
    }
    return false;
  }
  function agendar() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function(){
      if (protegida()) { agendar(); return; }
      dock.classList.add('recolhida');
    }, 8000);
  }
  function mostrar() { dock.dataset.segurando = '0'; dock.classList.remove('recolhida'); agendar(); }
  window['mostrarDock_' + dockId] = mostrar;
  _docksVivas.push(mostrar);
  /* Soltar o dedo em QUALQUER lugar limpa a marca (antes ela ficava presa
     quando o toque come\u00e7ava na dock e terminava sobre uma gaveta) */
  ['pointerup','touchend','touchcancel','mouseup'].forEach(function(ev){
    document.addEventListener(ev, function(){ dock.dataset.segurando = '0'; });
  });
  window['mostrarDock_' + dockId] = mostrar;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (y < 24) { mostrar(); }
    else if (y > lastY + 4 && !protegida()) { dock.classList.add('recolhida'); if (timer) clearTimeout(timer); }
    else if (y < lastY - 4) { mostrar(); }
    lastY = y;
  }, { passive:true });
  // Enquanto o dedo estiver na dock, ela não foge
  ['touchstart','pointerdown','mousedown'].forEach(function(ev){
    dock.addEventListener(ev, function(){ dock.dataset.segurando = '1'; mostrar(); });
  });
  ['touchend','pointerup','mouseup','touchcancel'].forEach(function(ev){
    dock.addEventListener(ev, function(){ dock.dataset.segurando = '0'; mostrar(); });
  });
  ['click','focusin','input','change'].forEach(function(ev){
    dock.addEventListener(ev, function(){ mostrar(); });
  });
  mostrar();
}
