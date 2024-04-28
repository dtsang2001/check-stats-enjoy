import { Button, Frog, TextInput } from 'frog'
import { Box, Heading, Text, Rows, Row, Divider, Image, Columns, Column, vars } from './ui.js'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { pinata } from 'frog/hubs'
import { neynar } from 'frog/middlewares'

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

const SITE_URL = "https://check-stats-enjoy.vercel.app/";

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  hub: pinata()
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

function Content(balance:string, remaining:number, unique_mints:string, unique_collectors:string, allowance:number, score:string) {
  if (typeof balance == "undefined") {
    return <Row paddingLeft="64" height="5/7"> 
            <Columns gap="8" grow> 
              <Column width="1/7" />
              <Column width="4/7"> 
                <Heading size="20"> You have not participated in this airdrop from ENJOY </Heading>
              </Column>
              <Column width="2/7" />
            </Columns>
          </Row>;
  }

  return <Row paddingLeft="64" height="5/7"> 
          <Columns gap="8" grow> 
            <Column width="1/7" />
            <Column width="4/7"> 
              <Rows gap="8" grow>
                <Row height="1/7" > <Heading size="20"> Tipping Balance </Heading> </Row>
                <Row paddingLeft="12" height="2/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Allowance: </Text> </Column>
                    <Column width="4/7"> <Text align='right' color="blue" weight="900" size="20"> { allowance.toLocaleString() } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Remaining: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right'>{ remaining.toLocaleString() }</Text> </Column>
                  </Columns>
                </Row>
                <Divider />
                <Row height="1/7" > <Heading size="20"> Other Information </Heading> </Row>
                <Row paddingLeft="12" height="3/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Score: </Text> </Column>
                    <Column width="4/7"> <Text color="blue" align='right' weight="900" size="20"> { score } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Unique Mints: </Text> </Column>
                    <Column width="2/7"> <Text color="blue" align='right'>{ unique_mints }</Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Unique Collectors: </Text> </Column>
                    <Column width="2/7"> <Text color="blue" align='right'>{ unique_collectors }</Text> </Column>
                  </Columns>
                </Row>
              </Rows>
            </Column>
            <Column width="2/7" />
          </Columns>
        </Row>;
}

app.frame('/', async (c) => {
  const { buttonValue, inputText, status, frameData, verified } = c
  const fruit = inputText || buttonValue
  const { fid } = frameData || {} 

  var { displayName, username, pfpUrl } = c.var.interactor || {};
  var remaining = 0, tips_given = 0;
  const { verifiedAddresses } = c.var.interactor || {}
  var { ethAddresses } = verifiedAddresses || {}

  if (typeof ethAddresses != 'undefined') {
    var data = {"sql":{"query":"SELECT * FROM snapshot.apr_21 WHERE LOWER(wallet) = :wallet LIMIT 1","parameters":[{"name":"wallet","type":"string","value":ethAddresses[0]}]}};
    var a = await fetch("https://api.usw2a1.rockset.com/v1/orgs/self/queries" ,{ method:"POST", headers: {
      'Content-Type': 'application/json', 
      'Authorization': 'ApiKey 4caspW3wv3VHBmb8jHfYHXRulo39cLrQGlaqFyFMlgszKCcraI8hMoFznFwSdMRw'
    }, body: JSON.stringify(data)});
    var { results } = JSON.parse(await a.text());

    if (results.length) {
      results = results[0];

      var datac = {"parameters":[{"name":"wallet","type":"string","value":ethAddresses[0]}]};
      var a = await fetch("https://api.usw2a1.rockset.com/v1/orgs/self/ws/gold/lambdas/current_tips_by_x/tags/latest" ,{ method:"POST", headers: {
        'Content-Type': 'application/json', 
        'Authorization': 'ApiKey 4caspW3wv3VHBmb8jHfYHXRulo39cLrQGlaqFyFMlgszKCcraI8hMoFznFwSdMRw'
      }, body: JSON.stringify(datac)});

      tips_given = parseInt(JSON.parse(await a.text()).results[0].tips_given || 0);
      

    } else {
      results = {};
    }
    var { balance, unique_mints, unique_collectors, allowance, score, rank } = results || {};
    allowance = parseInt(allowance || 0);
  } else {
    var { balance, unique_mints, unique_collectors, allowance, score, rank } = allowance || {};
  }

  remaining = allowance - tips_given;

  // console.log('followerCount', followerCount);
  
  const uriTip = "https://warpcast.com/dangs.eth/0x96d39fed";
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $ENJOY Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dthA76n5f82ws`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/enjoy_bg.jpg")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={pfpUrl || ""} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof balance != "undefined" ? `- OE Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(balance, remaining, unique_mints, unique_collectors, allowance, score) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button value="apples">My Stats</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>,
      <Button.Link href={uriTip}>💰Tip Here</Button.Link>,
    ],
  })
})

app.frame('/:fid/dthA76n5f82ws', async (c) => {

  const { req } = c

  const regex = /\/([0-9]*)\/dthA76n5f82ws/gm;
  const fid = [...req.url.matchAll(regex)][0][1];
  
  var user = await fetch("https://client.warpcast.com/v2/user-by-fid?fid="+fid ,{ method:"GET" });
  var { result } = JSON.parse(await user.text()) || {};
  var { displayName, username, pfp } = result.user || {};
  var { url } = pfp || {}
  var remaining = 0, tips_given = 0;

  var degen = await fetch("https://www.degentip.me/api/get_allowance?fid="+fid ,{ method:"GET" });
  var { allowance } = JSON.parse(await degen.text()) || {};
  var { wallet_address } = allowance || {};

  if (typeof wallet_address != 'undefined') {
    var data = {"sql":{"query":"SELECT * FROM snapshot.apr_21 WHERE LOWER(wallet) = :wallet LIMIT 1","parameters":[{"name":"wallet","type":"string","value":wallet_address}]}};
    var a = await fetch("https://api.usw2a1.rockset.com/v1/orgs/self/queries" ,{ method:"POST", headers: {
      'Content-Type': 'application/json', 
      'Authorization': 'ApiKey 4caspW3wv3VHBmb8jHfYHXRulo39cLrQGlaqFyFMlgszKCcraI8hMoFznFwSdMRw'
    }, body: JSON.stringify(data)});
    var { results } = JSON.parse(await a.text());
    
    if (results.length) {
      results = results[0];

      var datac = {"parameters":[{"name":"wallet","type":"string","value":wallet_address}]};
      var a = await fetch("https://api.usw2a1.rockset.com/v1/orgs/self/ws/gold/lambdas/current_tips_by_x/tags/latest" ,{ method:"POST", headers: {
        'Content-Type': 'application/json', 
        'Authorization': 'ApiKey 4caspW3wv3VHBmb8jHfYHXRulo39cLrQGlaqFyFMlgszKCcraI8hMoFznFwSdMRw'
      }, body: JSON.stringify(datac)});

      tips_given = parseInt(JSON.parse(await a.text()).results[0].tips_given || 0);

    } else {
      results = {};
    }
    var { balance, unique_mints, unique_collectors, allowance, score, rank } = results || {};
    allowance = parseInt(allowance || 0);
  } else {
    var { balance, unique_mints, unique_collectors, allowance, score, rank } = allowance || {};
  }

  remaining = allowance - tips_given;
  

  const uriTip = "https://warpcast.com/dangs.eth/0x96d39fed";
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $ENJOY Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dthA76n5f82ws`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/enjoy_bg.jpg")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={url} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading size="20"> {displayName} </Heading>
                <Text color="gray" size="14">@{username} { typeof balance != "undefined" ? `- OE Rank #${rank}` : `` }</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(balance, remaining, unique_mints, unique_collectors, allowance, score) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button action="/" value='/'>My Stats</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>,
      <Button.Link href={uriTip}>💰Tip Here</Button.Link>,
    ],
  })
})
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
