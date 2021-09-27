{
    function flatten(a, acc = []) {
        for (var i = 0; i < a.length; i++) {
            if (Array.isArray(a[i])) {
                flatten(a[i], acc);
            } else {
                acc.push(a[i]);
            }
        }
        return acc;
    }
    function make_header(hn,hv) {
        var m = {};
        m[hn] = hv;
        return m;
    }
    function make_move(move_number, move, nags, ravs, comment) {
        var m = {};
        if (move_number) m.move_number = move_number;
        if (move) m.move = move;
        if (nags && nags.length) m.nags = nags;
        if (ravs && ravs.length) m.ravs = ravs;
        if (comment) m.comment = comment;
        return m;
    }
    function make_rav(moves, result) {
        return {
            moves, 
            result
        };
    }
    function make_game(h, c, m, r) {
        h = h || [];
        return {
            headers: h.reduce((acc, x) => Object.assign(acc, x), {}),
            comment: c,
            moves: m || [],
            result: r
        };
    }
}

start = gs:(game newline*)* EOF {return gs.map(function(g) { return g[0]})}

game = 
    h:headers? 
    c:comment? 
    whitespace* 
    mr:(m:movetext whitespace+ r:result {return [m, r]} / r:result {return [null, r]}) 
    whitespace* {return make_game(h, c, mr[0], mr[1])}

EOF = !.
double_quote = '"'
string = double_quote str:[^"]* double_quote {return str.join('')}
integer = a:[1-9] b:[0-9]* {return parseInt(a+b.join(''), 10)}
symbol = chars:[A-Za-z0-9_-]+ {return chars.join('')}
ws = ' ' / '\f' / '\t'
whitespace = ws / newline
newline = '\n'

header = '[' hn:symbol ws+ hv:string ']' whitespace* { return make_header(hn,hv) }
headers = hs:header+ {return hs}

piece = [NKQRBP]
rank = [a-h]
file = [1-8]
check = "+"
checkmate = "#"
capture = "x"
drop = "@"
period = "."
result = "1-0" / "0-1" / "*" / "1/2-1/2"
move_number = mn:integer period? (period period)? {return mn}
square = r:rank f:file {return r+f}
promotion = "=" [QRBNK]
nag = chars:("$" integer) {return chars.join('')}
nag_alts = "!!" / "??" / "!?" / "?!" / "!" / "?"
continuation = period period period

comment_chars = [^}]
comment = "{" cc:comment_chars* "}" {return cc.join('');}

pawn_half_move = (r:rank c:capture)? square promotion?
piece_half_move = piece capture? square
piece_disambiguation_half_move = piece (rank / file) capture? square
castle_half_move = ("O-O-O" / "O-O")
drop_half_move = piece? drop square


half_move = m:(continuation? 
    (castle_half_move / 
     piece_disambiguation_half_move / 
     piece_half_move / 
     pawn_half_move /
     drop_half_move) 
    (check / checkmate)? 
    nag_alts?) {return flatten(m).join('');}

move = mn:move_number? 
       whitespace*
       m:half_move 
       nags:(whitespace+ n:nag {return n})*
       com:(whitespace+ c2:comment {return c2})? 
       ravs:(whitespace+ r:rav {return r})*
       {return make_move(mn, m, nags, ravs, com)}

movetext = first:move rest:(whitespace+ move)* {return first ? [first].concat(rest.map(function(m) {return m[1]})) : []}

rav = "(" 
    whitespace* 
    m:movetext 
    whitespace* 
    r:result?
    whitespace*
    ")" {return make_rav(m, r)}
